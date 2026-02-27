import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Custom reducer to deeply merge objects
const mergeObjects = (left: any, right: any): any => {
    if (!left) return right || {};
    if (!right) return left || {};
    return { ...left, ...right };
};

export const AgentStateSchema = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    analysis: Annotation<Record<string, any>>({
        reducer: mergeObjects,
        default: () => ({}),
    }),
    business_idea: Annotation<string>({
        reducer: (x, y) => y ?? x ?? "",
        default: () => "",
    }),
    blueprint: Annotation<Record<string, any>>({
        reducer: (x, y) => y ?? x ?? {},
        default: () => ({}),
    }),
    execution_results: Annotation<Record<string, any>>({
        reducer: mergeObjects,
        default: () => ({}),
    }),
});

export type AgentState = typeof AgentStateSchema.State;
