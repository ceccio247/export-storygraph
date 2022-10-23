(() => {
    /**
    * Check and set a global guard variable.
    * If this content script is injected into the same page again,
    * it will do nothing next time.
    */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    function sgBookPanelsToStr(element, options) {
        result = ''
        var panes = element.getElementsByClassName("book-pane-content");
        for(var i = 0; i < panes.length; i++) {
            var title_and_author = panes[i].getElementsByClassName("book-title-author-and-series")[0];
            
            // get title
            var title = title_and_author.getElementsByTagName("h3")[0]
                                        .getElementsByTagName("a")[0];
            title_text = title.innerText;
            result += title_text + '\n';

            // get author
            var author_series = title_and_author.getElementsByTagName("p");
            if (author_series.length != 0) {
                for (var j = 0; j < author_series.length; j++) {
                    if (options.series || j == author_series.length-1) {
                        var author = author_series[j].innerText;
                        if (author.length != 0) {
                            result += author + '\n';
                        }
                    }
                }
            }

            if (options.sgtags) {
                // get storygraph supplied tags
                var tags_container = panes[i].getElementsByClassName("leading-3")[0];
                if (tags_container != null) {
                    var tags_str = ''
                    var tags = tags_container.getElementsByTagName("span");
                    for (var j = 0; j < tags.length; j++) {
                        var tag = tags[j].innerText.trim();
                        if (tag.length != 0) {
                            tags_str += tag + ', ';
                        }
                    }
                    if (tags_str != '') {
                        result += tags_str.substring(0, tags_str.length-2) + '\n';
                    }
                }
            }

            if (options.usertags) {
                // get storygraph supplied tags
                var tags_container = panes[i].getElementsByClassName("tags-container")[0];
                if (tags_container != null) {
                    var tags_str = ''
                    var tags = tags_container.getElementsByTagName("a");
                    for (var j = 0; j < tags.length; j++) {
                        var tag = tags[j].innerText.trim();
                        if (tag.length != 0) {
                            tags_str += tag + ', ';
                        }
                    }
                    if (tags_str != '') {
                        result += tags_str.substring(0, tags_str.length-2) + '\n';
                    }
                }
            }

            // add url (from title)
            if (options.url) {
                var url = 'https://app.thestorygraph.com' + title.getAttribute('href');
                result += url + '\n';
            }

            result += '\n';
        }
        return result;
    }

    function getToReadElt() {
        const classes = [
            "to-read-books-panes",
            "filtered-to-read-books-panes",
            "owned-books-panes",
            "filtered-owned-books-panes",
            "read-books-panes",
            "filtered-read-books-panes",
        ]
        for (const classname of classes) {
            var toRead = document.getElementsByClassName(classname)[0];
            if (toRead != null) {
                return toRead;
            }
        }
        throw "no valid panes";
    }

    // credit to stackoverflow users Jeff Gran and tom_mai78101
    function copy_text(text) {
        //Create a textbox field where we can insert text to. 
        var copyFrom = document.createElement("textarea");

        //Set the text content to be the text you wished to copy.
        copyFrom.textContent = text;

        //Append the textbox field into the body as a child. 
        //"execCommand()" only works when there exists selected text, and the text is inside 
        //document.body (meaning the text is part of a valid rendered HTML element).
        document.body.appendChild(copyFrom);

        //Select all the text!
        copyFrom.select();

        //Execute command
        document.execCommand('copy');

        //(Optional) De-select the text using blur(). 
        copyFrom.blur();

        //Remove the textbox field from the document.body, so no other JavaScript nor 
        //other elements can get access to this.
        document.body.removeChild(copyFrom);
    } 

    // credit to ahuff44 on stackoverflow for this code.
    function download_file(name, contents, mime_type) {
        mime_type = mime_type || "text/plain";

        var blob = new Blob([contents], {type: mime_type});

        var dlink = document.createElement('a');
        dlink.download = name;
        dlink.href = window.URL.createObjectURL(blob);
        dlink.onclick = function(e) {
            // revokeObjectURL needs a delay to work properly
            var that = this;
            setTimeout(function() {
                window.URL.revokeObjectURL(that.href);
            }, 1500);
        };

        dlink.click();
        dlink.remove();
    }


    function sgExportDl(options) {
        if (window.isSecureContext) {
            download_file("toread_export.txt", sgBookPanelsToStr(getToReadElt(), options))
        } else {
            throw 'something went wrong'
        }
    }

    function sgExportClipboard(options) {
        if (window.isSecureContext) {
            copy_text(sgBookPanelsToStr(getToReadElt(), options))
        } else {
            throw 'cannot export to clipboard over http. use https.'
        }
    }

    chrome.runtime.onMessage.addListener((message) => {
        if (message.command === "sgexportclip") {
            sgExportClipboard(message.options);
        } else if (message.command === "sgexportdl") {
            sgExportDl(message.options);
        }
    });
})();

