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

    function sgBookPanelsToStr(element) {
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
                var author = author_series[author_series.length-1].innerText;
                if (author.length != 0) {
                    result += author + '\n';
                }
            }

            // get storygraph supplied tags
            var tags_container = panes[i].getElementsByClassName("leading-3")[0];
            if (tags_container != null) {
                var tags_str = ''
                var tags = tags_container.getElementsByTagName("span");
                for (var j = 0; j < tags.length; j++) {
                    var tag = tags[j].innerText;
                    if (tag.length != 0) {
                        tags_str += tag + ', ';
                    }
                }
                if (tags_str != '') {
                    result += tags_str.substring(0, tags_str.length-2) + '\n';
                }
            }

            // add url (from title)
            var url = 'https://app.thestorygraph.com' + title.getAttribute('href');
            result += url + '\n';

            result += '\n';
        }
        return result;
    }

    function getToReadElt() {
        var toRead = document.getElementsByClassName("to-read-books-panes")[0]
        if (toRead == null) {
            toRead = document.getElementsByClassName("filtered-to-read-books-panes")[0]
        }
        return toRead
    }

    function sgExport() {
        if (window.isSecureContext) {
            navigator.clipboard.writeText(sgBookPanelsToStr(getToReadElt()))
        } else {
            throw 'cannot export to clipboard over http. use https.'
        }
    }

    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "sgexport") {
            sgExport();
        }
    });
})();

