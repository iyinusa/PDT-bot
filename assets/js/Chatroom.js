$(function () {
    "use strict";

    const rasaSever = 'http://localhost:5005';
    const chatEndpoint = 'webhooks/rest/webhook';
    const apiHeader = {
        'Content-Type': 'application/json; charset=utf-8'
    }
    const chatCanvas = $('.chat-canvas');

    const chatThinking = '<img alt="" src="assets/images/thinking.gif" class="thinking" />';

    $('.send').on('click', function () { 
        var input = $('#input').val();

        // check if user send an input
        if (input == '') {
            chatNotify('Please type something!');
            return false;
        }

        // append user input to chat canvas
        chatCanvas.append(bubble('User', input));
        $('#input').val(''); // clear input textbox

        // send user input to Rasa Server via API
        $.ajax({
            url: rasaSever + '/' + chatEndpoint,
            type: "POST",
            headers: apiHeader,
            dataType: "json",
            data: JSON.stringify({
                "sender": "bot-user",
                "message": input
            }),
            beforeSend: function () {
                chatCanvas.append(chatThinking); // add chat thinking
            },
            success: function (data, textStatus, xhr) {
                $('.thinking').remove(); // remove thinking animation

                var botResponse = '';
                if (data.length !== 0 && textStatus == 'success') botResponse = renderResponse(data);

                if (botResponse != '') {
                    // append bot response to canvas
                    chatCanvas.append(bubble('PDT', botResponse));

                    // keep at the bottom of the chat canvas
                    chatCanvas.scrollTop(chatCanvas[0].scrollHeight);
                } else {
                    chatNotify('No Response');
                    // call model outside Rasa
                }
            },
            error: function (xhr, errorThrown) {
                chatNotify('Please check Rasa Server');
            }
        });
    });

    /**
     * The function `renderResponse` processes data to generate HTML elements based on the keys 'text'
     * and 'image'.
     * @param data - It seems like you were about to provide the data parameter for the
     * `renderResponse` function. Could you please provide the data object or array that you want to
     * pass to the `renderResponse` function?
     * @returns The `renderResponse` function returns a string containing HTML elements based on the
     * data provided. It creates `<div>` elements with text content if the key is 'text', and `<div>`
     * elements with image content if the key is 'image'.
     */
    function renderResponse(data) {
        var resp = '';
        $.each(data, function(index, val) {
            $.each(val, function (key, value) { 
                if (key == 'text') resp += '<div>' + value + '</div>';
                if (key == 'image') resp += '<div><img alt="" src="' + value + '" /></div>';
            });
        });
        return resp;
    }

    function chatNotify(msg) {
        const chat_notify = $('.chat-notify');
        chat_notify.html(msg);
        chat_notify.show(500);

        setTimeout(function () { 
            chat_notify.hide(500);
        }, 5000);
    }

    /**
     * The function "bubble" generates a message bubble with a specified type and message content.
     * @param type - The `type` parameter is a string that represents the type of message being
     * displayed.
     * @param msg - The `msg` parameter in the `bubble` function represents the message content that
     * will be displayed inside the bubble. It is the actual text or information that you want to show
     * within the bubble element.
     * @returns <div class="bubble-user">PDT <div class="msg">[msg]</div></div>
     */
    function bubble(type, msg) {
        var bubbleType = 'pdt';
        if (type != 'PDT') bubbleType = 'user';
            
        return '<div class="bubble-' + bubbleType + '">' + type + ' <div class="msg">' + msg + '</div></div>';
    }
});