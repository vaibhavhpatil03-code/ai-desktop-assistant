require("dotenv").config();

const express = require("express");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const OpenAI = require("openai");

const app = express();
const PORT = 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==================================================
// WINDOWS FUNCTIONS
// ==================================================

function openWindows(target) {

    return new Promise((resolve, reject) => {

        if (process.platform !== "win32") {
            return reject(
                new Error("This assistant currently supports Windows.")
            );
        }

        const child = spawn(
            "explorer.exe",
            [target],
            {
                detached: true,
                stdio: "ignore"
            }
        );

        child.on("error", reject);

        child.unref();

        resolve();
    });
}


function openApplication(command, args = []) {

    return new Promise((resolve, reject) => {

        if (process.platform !== "win32") {
            return reject(
                new Error("This assistant currently supports Windows.")
            );
        }

        const child = spawn(
            command,
            args,
            {
                detached: true,
                stdio: "ignore"
            }
        );

        child.on("error", reject);

        child.unref();

        resolve();
    });
}


function openWebsite(url) {

    return new Promise((resolve, reject) => {

        if (process.platform !== "win32") {
            return reject(
                new Error("This assistant currently supports Windows.")
            );
        }

        const child = spawn(
            "rundll32.exe",
            [
                "url.dll,FileProtocolHandler",
                url
            ],
            {
                detached: true,
                stdio: "ignore"
            }
        );

        child.on("error", reject);

        child.unref();

        resolve();
    });
}


// ==================================================
// APPROVED APPLICATIONS
// ==================================================

const APPLICATIONS = {

    notepad: {
        command: "notepad.exe"
    },

    calculator: {
        command: "calc.exe"
    },

    calc: {
        command: "calc.exe"
    },

    paint: {
        command: "mspaint.exe"
    },

    cmd: {
        command: "cmd.exe"
    },

    powershell: {
        command: "powershell.exe"
    }

};


// ==================================================
// AI TOOLS
// ==================================================

const tools = [

    {
        type: "function",

        name: "open_website",

        description:
            "Open a website in the user's default browser. Use this when the user asks to open a website such as YouTube, Google, GitHub, Wikipedia, or a supplied URL.",

        parameters: {

            type: "object",

            properties: {

                url: {
                    type: "string",
                    description:
                        "Complete URL including https://"
                }

            },

            required: ["url"],

            additionalProperties: false
        },

        strict: true
    },


    {
        type: "function",

        name: "open_windows_folder",

        description:
            "Open an approved Windows folder or Windows Explorer location.",

        parameters: {

            type: "object",

            properties: {

                folder: {
                    type: "string",

                    enum: [
                        "this_pc",
                        "downloads",
                        "documents",
                        "desktop",
                        "pictures",
                        "videos",
                        "recycle_bin"
                    ]
                }

            },

            required: ["folder"],

            additionalProperties: false
        },

        strict: true
    },


    {
        type: "function",

        name: "open_application",

        description:
            "Open an approved Windows application.",

        parameters: {

            type: "object",

            properties: {

                application: {
                    type: "string",

                    enum: [
                        "notepad",
                        "calculator",
                        "paint",
                        "cmd",
                        "powershell"
                    ]
                }

            },

            required: ["application"],

            additionalProperties: false
        },

        strict: true
    }

];


// ==================================================
// EXECUTE TOOL
// ==================================================

async function executeTool(name, args) {

    console.log(
        "AI requested:",
        name,
        args
    );


    // ----------------------------------------------
    // WEBSITE
    // ----------------------------------------------

    if (name === "open_website") {

        const url = args.url;

        // Basic URL safety check
        if (
            !url.startsWith("https://") &&
            !url.startsWith("http://")
        ) {
            throw new Error(
                "Only HTTP and HTTPS websites are allowed."
            );
        }

        await openWebsite(url);

        return {
            success: true,
            message: `Opened ${url}`
        };
    }


    // ----------------------------------------------
    // WINDOWS FOLDER
    // ----------------------------------------------

    if (name === "open_windows_folder") {

        const home = os.homedir();

        const folders = {

            this_pc:
                "shell:MyComputerFolder",

            downloads:
                path.join(
                    home,
                    "Downloads"
                ),

            documents:
                path.join(
                    home,
                    "Documents"
                ),

            desktop:
                path.join(
                    home,
                    "Desktop"
                ),

            pictures:
                path.join(
                    home,
                    "Pictures"
                ),

            videos:
                path.join(
                    home,
                    "Videos"
                ),

            recycle_bin:
                "shell:RecycleBinFolder"
        };


        const target = folders[args.folder];

        if (!target) {
            throw new Error(
                "That folder is not available."
            );
        }


        await openWindows(target);


        return {
            success: true,
            message:
                `Opened ${args.folder.replace("_", " ")}`
        };
    }


    // ----------------------------------------------
    // APPLICATION
    // ----------------------------------------------

    if (name === "open_application") {

        const application =
            APPLICATIONS[args.application];


        if (!application) {

            throw new Error(
                "That application is not allowed."
            );

        }


        await openApplication(
            application.command,
            application.args || []
        );


        return {
            success: true,
            message:
                `Opened ${args.application}`
        };
    }


    throw new Error(
        `Unknown tool: ${name}`
    );
}


// ==================================================
// CHAT API
// ==================================================

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const messages =
                Array.isArray(req.body.messages)
                    ? req.body.messages
                    : [];


            if (messages.length === 0) {

                return res.status(400).json({
                    error:
                        "No messages supplied."
                });

            }


            const response =
                await client.responses.create({

                    model: "gpt-5.6-luna",

                    instructions: `
You are a helpful Windows desktop AI assistant.

You can have normal conversations.

You can also perform approved computer actions using your tools.

IMPORTANT:
- Never claim you opened something unless the tool actually succeeded.
- Use the tools when the user asks you to open a website, folder, or approved application.
- Do not invent tools.
- Do not execute arbitrary shell commands.
- Do not attempt to access arbitrary files.
- If an action is unavailable, explain that clearly.
- Keep responses concise and friendly.
`,

                    input: messages,

                    tools: tools
                });


            let finalResponse = response;


            // ==================================================
            // TOOL LOOP
            // ==================================================

            while (
                finalResponse.output &&
                finalResponse.output.some(
                    item =>
                        item.type ===
                        "function_call"
                )
            ) {

                const toolOutputs = [];


                for (
                    const item
                    of finalResponse.output
                ) {

                    if (
                        item.type !==
                        "function_call"
                    ) {
                        continue;
                    }


                    const args =
                        JSON.parse(
                            item.arguments
                        );


                    try {

                        const result =
                            await executeTool(
                                item.name,
                                args
                            );


                        toolOutputs.push({

                            type:
                                "function_call_output",

                            call_id:
                                item.call_id,

                            output:
                                JSON.stringify(
                                    result
                                )
                        });


                    } catch (error) {

                        toolOutputs.push({

                            type:
                                "function_call_output",

                            call_id:
                                item.call_id,

                            output:
                                JSON.stringify({
                                    success: false,

                                    error:
                                        error.message
                                })
                        });

                    }

                }


                finalResponse =
                    await client.responses.create({

                        model:
                            "gpt-5.6-luna",

                        instructions: `
You are a helpful Windows desktop AI assistant.

Explain the result of the requested action naturally.

If a tool returned an error, tell the user that the action failed.
Do not claim success when the tool reported failure.
`,

                        previous_response_id:
                            finalResponse.id,

                        input:
                            toolOutputs,

                        tools:
                            tools
                    });

            }


            res.json({

                success: true,

                message:
                    finalResponse.output_text ||
                    "Done."

            });


        } catch (error) {

            console.error(error);


            res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "Something went wrong."

            });

        }

    }
);


// ==================================================
// SERVER
// ==================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "===================================="
        );
        console.log(
            " AI Desktop Assistant"
        );
        console.log(
            "===================================="
        );
        console.log("");
        console.log(
            `http://localhost:${PORT}`
        );
        console.log("");

    }
);