const form =
    document.getElementById("commandForm");

const input =
    document.getElementById("commandInput");

const chat =
    document.getElementById("chat");

const typing =
    document.getElementById("typing");

const sendButton =
    document.getElementById("sendButton");


const conversation = [];


// ==================================================
// ADD MESSAGE
// ==================================================

function addMessage(
    text,
    type = "assistant"
) {

    const message =
        document.createElement("div");

    message.className =
        `message ${type}`;


    const avatar =
        document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
        type === "user"
            ? "YOU"
            : "AI";


    const bubble =
        document.createElement("div");

    bubble.className = "bubble";


    const paragraph =
        document.createElement("p");

    paragraph.textContent = text;


    bubble.appendChild(paragraph);

    message.appendChild(avatar);

    message.appendChild(bubble);

    chat.appendChild(message);


    chat.scrollTop =
        chat.scrollHeight;
}


// ==================================================
// SEND TO AI
// ==================================================

async function sendMessage(text) {

    if (!text.trim()) {
        return;
    }


    addMessage(
        text,
        "user"
    );


    conversation.push({

        role: "user",

        content: text

    });


    input.value = "";

    sendButton.disabled = true;

    typing.classList.remove(
        "hidden"
    );


    try {

        const response =
            await fetch(
                "/api/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        messages:
                            conversation
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Server error"
            );

        }


        const answer =
            data.message ||
            "Done.";


        conversation.push({

            role: "assistant",

            content: answer

        });


        addMessage(
            answer,
            "assistant"
        );


    } catch (error) {

        addMessage(
            "Error: " +
            error.message,
            "assistant"
        );

    } finally {

        typing.classList.add(
            "hidden"
        );

        sendButton.disabled = false;

        input.focus();

    }

}


// ==================================================
// FORM
// ==================================================

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        sendMessage(
            input.value
        );

    }
);


input.focus();