const fs = require('fs');
const path = require('path');

const pyPredictiveDir = path.join(__dirname, '../backend/app/agents/predictive');
const pyExecutionDir = path.join(__dirname, '../backend/app/agents/execution');

const tsPredictiveDir = path.join(__dirname, 'src/agents/predictive');
const tsExecutionDir = path.join(__dirname, 'src/agents/execution');

if (!fs.existsSync(tsPredictiveDir)) fs.mkdirSync(tsPredictiveDir, { recursive: true });
if (!fs.existsSync(tsExecutionDir)) fs.mkdirSync(tsExecutionDir, { recursive: true });

function convertAgent(pyFilePath, tsFilePath, isExecution) {
    if (Object.keys(specialFiles).includes(path.basename(pyFilePath))) return; // skip special files

    const pyCode = fs.readFileSync(pyFilePath, 'utf8');

    // Extract node name
    const nodeNameMatch = pyCode.match(/def\s+(\w+)\(/);
    const nodeName = nodeNameMatch ? nodeNameMatch[1] : '';
    const camelNodeName = nodeName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

    // Extract prompt
    const promptStart = pyCode.indexOf('f"""');
    const promptEnd = pyCode.indexOf('"""', promptStart + 4);
    let prompt = '';
    if (promptStart !== -1 && promptEnd !== -1) {
        prompt = pyCode.substring(promptStart + 4, promptEnd);
        prompt = prompt.replace(/\{state\['business_idea'\]\}/g, '${state.business_idea}');
        prompt = prompt.replace(/\{json\.dumps\(blueprint\)\}/g, '${JSON.stringify(blueprint)}');
        prompt = prompt.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
    }

    // Extract default data
    const dataMatch = pyCode.match(/data\s*=\s*(\{[\s\S]*?\})\s*return/);
    let defaultData = dataMatch ? dataMatch[1] : '{}';
    // Fix Python dictionary to JS object (convert single quotes to double, True to true, False to false, etc if necessary, but we'll try to just dump it securely)

    // To safely parse python dict, we might need a regex or simply keep it as JS code

    // Extract return statement
    const returnMatch = pyCode.match(/return\s*(\{[\s\S]*?\})\s*$/);
    let returnStatement = returnMatch ? returnMatch[1] : '{}';
    // In TS, the object keys might need quotes or not, but typically they are fine.

    const tsCode = `
import { SystemMessage } from "@langchain/core/messages";
import { AgentState } from "../state";
import { getStructuralLlm } from "../llm";

export const ${camelNodeName} = async (state: AgentState): Promise<Partial<AgentState>> => {
    const llm = getStructuralLlm();
    ${isExecution ? "const blueprint = state.blueprint || {};" : ""}
    const prompt = \`${prompt}\`;
    
    const response = await llm.invoke([new SystemMessage({ content: prompt })]);
    let data;
    try {
        const content = typeof response.content === "string" ? response.content : "";
        const match = content.match(/\\{[\\s\\S]*\\}/);
        if (match) {
            data = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found");
        }
    } catch (e) {
        console.error("${camelNodeName} generation failed:");
        data = ${defaultData.trim()};
    }
    return ${returnStatement.trim()};
};
`;
    fs.writeFileSync(tsFilePath, tsCode.trim());
}

const specialFiles = ['blueprint.py', '__init__.py'];

// Process predictive agents
if (fs.existsSync(pyPredictiveDir)) {
    const files = fs.readdirSync(pyPredictiveDir);
    files.forEach(file => {
        if (file.endsWith('.py') && !specialFiles.includes(file)) {
            const pyPath = path.join(pyPredictiveDir, file);
            const tsPath = path.join(tsPredictiveDir, file.replace('.py', '.ts'));
            convertAgent(pyPath, tsPath, false);
        }
    });
}

// Process execution agents
if (fs.existsSync(pyExecutionDir)) {
    const files = fs.readdirSync(pyExecutionDir);
    files.forEach(file => {
        if (file.endsWith('.py') && !specialFiles.includes(file)) {
            const pyPath = path.join(pyExecutionDir, file);
            const tsPath = path.join(tsExecutionDir, file.replace('.py', '.ts'));
            convertAgent(pyPath, tsPath, true);
        }
    });
}

console.log("Migration script executed.");
