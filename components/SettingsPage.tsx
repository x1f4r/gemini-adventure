import React from 'react';

interface SettingsPageProps {
    initialGameState: any;
    systemInstruction: string;
    responseSchema: any;
    themeStyles: any;
    onInitialGameStateChange: (newInitialGameState: any) => void;
    onSystemInstructionChange: (newSystemInstruction: string) => void;
    onResponseSchemaChange: (newResponseSchema: any) => void;
    onThemeStylesChange: (newThemeStyles: any) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    initialGameState,
    systemInstruction,
    responseSchema,
    themeStyles,
    onInitialGameStateChange,
    onSystemInstructionChange,
    onResponseSchemaChange,
    onThemeStylesChange,
}) => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="mt-4">
                <h2 className="text-xl font-bold">Initial Game State</h2>
                <textarea
                    className="w-full h-64 p-2 mt-2 border rounded"
                    value={JSON.stringify(initialGameState, null, 2)}
                    onChange={(e) => onInitialGameStateChange(JSON.parse(e.target.value))}
                />
            </div>
            <div className="mt-4">
                <h2 className="text-xl font-bold">System Instruction</h2>
                <textarea
                    className="w-full h-64 p-2 mt-2 border rounded"
                    value={systemInstruction}
                    onChange={(e) => onSystemInstructionChange(e.target.value)}
                />
            </div>
            <div className="mt-4">
                <h2 className="text-xl font-bold">Response Schema</h2>
                <textarea
                    className="w-full h-64 p-2 mt-2 border rounded"
                    value={JSON.stringify(responseSchema, null, 2)}
                    onChange={(e) => onResponseSchemaChange(JSON.parse(e.target.value))}
                />
            </div>
            <div className="mt-4">
                <h2 className="text-xl font-bold">Theme Styles</h2>
                <textarea
                    className="w-full h-64 p-2 mt-2 border rounded"
                    value={JSON.stringify(themeStyles, null, 2)}
                    onChange={(e) => onThemeStylesChange(JSON.parse(e.target.value))}
                />
            </div>
        </div>
    );
};

export default SettingsPage;
