/**
 * ESLint Rules for Null Safety
 * 
 * Custom ESLint rules to enforce null safety patterns and prevent runtime crashes.
 * These rules complement the null safety validator script.
 */

module.exports = {
  rules: {
    // Rule: Enforce optional chaining for potentially null object access
    'null-safety/use-optional-chaining': {
      create(context) {
        return {
          MemberExpression(node) {
            // Skip if optional chaining is already used
            if (node.optional) {
              return;
            }

            // Skip common safe patterns
            const safeProperties = [
              'length', 'toString', 'valueOf', 'constructor', 'prototype',
              'test', 'exec', 'match', 'replace', 'split', 'join', 'slice', 'substring',
              'getTime', 'getDate', 'getFullYear', 'getMonth', 'getDay',
              'toFixed', 'toPrecision', 'toExponential',
              'toLowerCase', 'toUpperCase', 'trim', 'startsWith', 'endsWith', 'includes',
              'push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort',
              'setAttribute', 'getAttribute', 'addEventListener', 'removeEventListener',
              'className', 'id', 'textContent', 'innerHTML', 'value',
              'props', 'state', 'refs', 'context', 'children', 'key', 'ref',
              'name', 'message', 'stack',
              'JSON', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean',
              'window', 'document', 'console', 'localStorage', 'sessionStorage',
              'process', 'require', 'module', 'exports', '__dirname', '__filename'
            ];

            if (safeProperties.includes(node.property.name)) {
              return;
            }

            // Check if the object might be null based on variable name patterns
            const objectName = node.object.name;
            const nullishPatterns = [
              /profileData/, /userData/, /formData/, /workoutData/, /focusData/,
              /apiResponse/, /response/, /result/, /data/, /config/, /settings/,
              /state/, /props/, /context/, /options/, /selections/, /preferences/
            ];

            const isPotentiallyNull = nullishPatterns.some(pattern => 
              pattern.test(objectName)
            );

            if (isPotentiallyNull) {
              context.report({
                node,
                message: `Use optional chaining (?.) for potentially null object '${objectName}'`,
                fix(fixer) {
                  return fixer.insertTextAfter(node.object, '?');
                }
              });
            }
          }
        };
      }
    },

    // Rule: Enforce nullish coalescing for default values
    'null-safety/use-nullish-coalescing': {
      create(context) {
        return {
          LogicalExpression(node) {
            // Only check OR expressions that might be used for default values
            if (node.operator !== '||') {
              return;
            }

            // Check if the left operand might be null/undefined
            const leftOperand = node.left;
            const nullishPatterns = [
              /profileData/, /userData/, /formData/, /workoutData/, /focusData/,
              /apiResponse/, /response/, /result/, /data/, /config/, /settings/,
              /state/, /props/, /context/, /options/, /selections/, /preferences/
            ];

            const isPotentiallyNull = nullishPatterns.some(pattern => 
              pattern.test(leftOperand.name)
            );

            if (isPotentiallyNull) {
              context.report({
                node,
                message: `Use nullish coalescing (??) instead of logical OR (||) for potentially null value '${leftOperand.name}'`,
                fix(fixer) {
                  return fixer.replaceText(node.operator, '??');
                }
              });
            }
          }
        };
      }
    },

    // Rule: Enforce null checks before array operations
    'null-safety/check-array-before-operation': {
      create(context) {
        const arrayMethods = [
          'forEach', 'map', 'filter', 'reduce', 'find', 'some', 'every',
          'includes', 'indexOf', 'lastIndexOf', 'slice', 'splice',
          'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'join', 'concat'
        ];

        return {
          CallExpression(node) {
            if (node.callee.type !== 'MemberExpression') {
              return;
            }

            const methodName = node.callee.property.name;
            if (!arrayMethods.includes(methodName)) {
              return;
            }

            const arrayObject = node.callee.object;
            const nullishPatterns = [
              /profileData/, /userData/, /formData/, /workoutData/, /focusData/,
              /apiResponse/, /response/, /result/, /data/, /config/, /settings/,
              /state/, /props/, /context/, /options/, /selections/, /preferences/,
              /locations/, /activities/, /equipment/, /areas/, /exercises/
            ];

            const isPotentiallyNull = nullishPatterns.some(pattern => 
              pattern.test(arrayObject.name)
            );

            if (isPotentiallyNull) {
              // Check if there's a null check in the same scope
              const scope = context.getScope();
              const hasNullCheck = scope.block.body?.some(statement => {
                if (statement.type === 'IfStatement') {
                  const test = statement.test;
                  return test.type === 'UnaryExpression' && 
                         test.operator === '!' && 
                         test.argument.name === arrayObject.name;
                }
                return false;
              });

              if (!hasNullCheck) {
                context.report({
                  node,
                  message: `Add null check before calling array method '${methodName}' on potentially null array '${arrayObject.name}'`,
                  suggest: [
                    {
                      desc: 'Add null check',
                      fix(fixer) {
                        const sourceCode = context.getSourceCode();
                        const text = sourceCode.getText(node);
                        return fixer.replaceText(node, `(${arrayObject.name} || []).${methodName}${text.slice(text.indexOf('('))}`);
                      }
                    }
                  ]
                });
              }
            }
          }
        };
      }
    },

    // Rule: Enforce defensive state updates
    'null-safety/defensive-state-update': {
      create(context) {
        return {
          CallExpression(node) {
            // Check for setState patterns
            if (node.callee.type !== 'Identifier' || !node.callee.name.startsWith('set')) {
              return;
            }

            if (node.arguments.length === 1 && 
                node.arguments[0].type === 'ArrowFunctionExpression' &&
                node.arguments[0].body.type === 'ObjectExpression') {
              
              const arrowFunction = node.arguments[0];
              const objectExpression = arrowFunction.body;
              
              // Check if it uses spread operator with 'prev'
              const hasSpreadPrev = objectExpression.properties.some(prop => 
                prop.type === 'SpreadElement' && 
                prop.argument.name === 'prev'
              );

              if (hasSpreadPrev) {
                context.report({
                  node,
                  message: 'State update should check if previous state exists before spreading',
                  suggest: [
                    {
                      desc: 'Add null check for previous state',
                      fix(fixer) {
                        const sourceCode = context.getSourceCode();
                        const text = sourceCode.getText(node);
                        const newText = text.replace(
                          /\(\s*\.\.\.prev\s*,/g,
                          '(...(prev || {}),'
                        );
                        return fixer.replaceText(node, newText);
                      }
                    }
                  ]
                });
              }
            }
          }
        };
      }
    },

    // Rule: Enforce early returns for null checks
    'null-safety/early-return-null-check': {
      create(context) {
        return {
          FunctionDeclaration(node) {
            const functionBody = node.body;
            if (functionBody.type !== 'BlockStatement') {
              return;
            }

            // Check if function has parameters that might be null
            const nullishParams = node.params.filter(param => {
              const nullishPatterns = [
                /profileData/, /userData/, /formData/, /workoutData/, /focusData/,
                /apiResponse/, /response/, /result/, /data/, /config/, /settings/,
                /state/, /props/, /context/, /options/, /selections/, /preferences/
              ];
              return nullishPatterns.some(pattern => pattern.test(param.name));
            });

            if (nullishParams.length === 0) {
              return;
            }

            // Check if there's an early return with null check
            const hasEarlyReturn = functionBody.body.some(statement => {
              if (statement.type === 'IfStatement') {
                const test = statement.test;
                if (test.type === 'UnaryExpression' && test.operator === '!') {
                  const paramName = test.argument.name;
                  return nullishParams.some(param => param.name === paramName);
                }
              }
              return false;
            });

            if (!hasEarlyReturn) {
              context.report({
                node,
                message: `Function should have early return for null check on parameter(s): ${nullishParams.map(p => p.name).join(', ')}`,
                suggest: [
                  {
                    desc: 'Add early return with null check',
                    fix(fixer) {
                      const firstParam = nullishParams[0];
                      const sourceCode = context.getSourceCode();
                      const functionText = sourceCode.getText(node);
                      const bodyStart = functionText.indexOf('{') + 1;
                      
                      const earlyReturn = `
  if (!${firstParam.name}) {
    return null;
  }
`;
                      
                      return fixer.insertTextAfterRange([node.start + bodyStart, node.start + bodyStart], earlyReturn);
                    }
                  }
                ]
              });
            }
          }
        };
      }
    }
  }
}; 