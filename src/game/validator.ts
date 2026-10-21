export interface ExecutionResult {
  success: boolean;
  logs: string[];
  error?: string;
  friendlyError?: string;
  feedback: string;
  variables: Record<string, any>;
}

export interface ValidationConfig {
  expectedLogPatterns?: string[];
  forbiddenPatterns?: string[];
  requiredKeywords?: string[];
  expectedVariables?: Record<string, any>;
  customValidator?: (logs: string[], vars: Record<string, any>, rawCode: string) => { passed: boolean; reason: string };
}

/**
 * Safely executes JavaScript code in a sandboxed Function context,
 * capturing console logs and variables declared in outer evaluation scope.
 */
export function executeCode(code: string): { logs: string[]; error?: string; friendlyError?: string; variables: Record<string, any> } {
  const logs: string[] = [];
  const capturedVars: Record<string, any> = {};

  // Catch basic bad patterns before running
  const normalized = code.replace(/\s+/g, '');
  if (
    normalized.includes('while(true)') ||
    normalized.includes('while(1)') ||
    normalized.includes('for(;;)') ||
    normalized.includes('do{') && normalized.includes('}while(true)')
  ) {
    return {
      logs: [],
      error: 'Infinite loop detected',
      friendlyError: 'Careful! That looks like an infinite loop that would freeze your browser.',
      variables: {},
    };
  }

  // Create isolated console recorder
  const mockConsole = {
    log: (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    info: (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    error: (...args: any[]) => {
      logs.push('[Error] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
  };

  try {
    // Sandbox header shadowing DOM and network globals
    const sandboxPreamble = `
      "use strict";
      const console = arguments[0];
      const window = undefined;
      const document = undefined;
      const localStorage = undefined;
      const sessionStorage = undefined;
      const fetch = undefined;
      const XMLHttpRequest = undefined;
      const WebSocket = undefined;
    `;

    const runner = new Function(`${sandboxPreamble}\n${code}`);
    runner(mockConsole);

    // Single-pass variable extraction for declared variables
    const varNames = Array.from(code.matchAll(/(?:let|var|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g), m => m[1]);
    if (varNames.length > 0) {
      try {
        const silentConsole = { log: () => {}, info: () => {}, error: () => {} };
        const returnEntries = varNames.map(v => `"${v}": (typeof ${v} !== 'undefined' ? ${v} : undefined)`).join(', ');
        const inspectFn = new Function(`
          ${sandboxPreamble}
          ${code}
          return { ${returnEntries} };
        `);
        const extracted = inspectFn(silentConsole);
        Object.assign(capturedVars, extracted);
      } catch {
        // Variable couldn't be extracted in batch eval
      }
    }

    return { logs, variables: capturedVars };
  } catch (err: any) {
    const rawError = err ? err.message || String(err) : 'Unknown error';
    let friendly = 'There seems to be an issue in your code.';

    if (rawError.includes('is not defined')) {
      friendly = `Check your spelling! A name wasn't recognized: ${rawError}.`;
    } else if (rawError.includes('Unexpected token') || rawError.includes('Unexpected identifier')) {
      friendly = 'Double-check your syntax! Make sure every quote `"` and parenthesis `)` has a matching partner.';
    } else if (rawError.includes('missing ) after argument list')) {
      friendly = 'Did you forget to close your parenthesis `)` at the end of the line?';
    } else if (rawError.includes('Invalid or unexpected token')) {
      friendly = 'Look out for mismatched or fancy quotes, or special characters.';
    }

    return {
      logs,
      error: rawError,
      friendlyError: friendly,
      variables: {},
    };
  }
}

/**
 * Validates the user code execution against quest criteria.
 */
export function validateSolution(code: string, config: ValidationConfig): ExecutionResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      success: false,
      logs: [],
      error: 'Empty code',
      friendlyError: 'Your code editor is empty! Type your solution and press "Run Code".',
      feedback: 'Type your solution in the code editor.',
      variables: {},
    };
  }

  // Check required keywords if specified
  if (config.requiredKeywords && config.requiredKeywords.length > 0) {
    for (const keyword of config.requiredKeywords) {
      if (!trimmed.includes(keyword)) {
        return {
          success: false,
          logs: [],
          feedback: `Make sure to use '${keyword}' in your solution.`,
          variables: {},
        };
      }
    }
  }

  // Check forbidden patterns if specified
  if (config.forbiddenPatterns && config.forbiddenPatterns.length > 0) {
    for (const forbidden of config.forbiddenPatterns) {
      if (trimmed.includes(forbidden)) {
        return {
          success: false,
          logs: [],
          feedback: `Avoid using '${forbidden}' for this challenge.`,
          variables: {},
        };
      }
    }
  }

  const { logs, error, friendlyError, variables } = executeCode(trimmed);

  if (error) {
    return {
      success: false,
      logs,
      error,
      friendlyError,
      feedback: friendlyError || error,
      variables,
    };
  }

  // Check expected variables
  if (config.expectedVariables) {
    for (const [varName, expectedVal] of Object.entries(config.expectedVariables)) {
      if (!(varName in variables)) {
        return {
          success: false,
          logs,
          feedback: `Did you declare the variable '${varName}'? Use: let ${varName} = ...`,
          variables,
        };
      }
      if (expectedVal !== undefined && variables[varName] !== expectedVal) {
        return {
          success: false,
          logs,
          feedback: `Variable '${varName}' has value ${JSON.stringify(variables[varName])}, but expected ${JSON.stringify(expectedVal)}.`,
          variables,
        };
      }
    }
  }

  // Check expected logs
  if (config.expectedLogPatterns && config.expectedLogPatterns.length > 0) {
    if (logs.length === 0) {
      return {
        success: false,
        logs,
        feedback: "Nothing was printed to the console! Did you call console.log(...) ?",
        variables,
      };
    }

    const combinedLogs = logs.join('\n').toLowerCase();
    for (const pattern of config.expectedLogPatterns) {
      const normalizedPattern = pattern.toLowerCase();
      if (!combinedLogs.includes(normalizedPattern)) {
        return {
          success: false,
          logs,
          feedback: `Expected console output to contain "${pattern}", but got: "${logs.join(', ')}".`,
          variables,
        };
      }
    }
  }

  // Run custom validator if present
  if (config.customValidator) {
    const customRes = config.customValidator(logs, variables, trimmed);
    if (!customRes.passed) {
      return {
        success: false,
        logs,
        feedback: customRes.reason,
        variables,
      };
    }
  }

  return {
    success: true,
    logs,
    feedback: 'Fantastic! Challenge completed with flying colors! 🎉',
    variables,
  };
}
