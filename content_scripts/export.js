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
            var title = title_and_author.getElementsByTagName("h3")[0];
            title = title.getElementsByTagName("a")[0].innerHTML;
            result += title;

            var author_series = title_and_author.getElementsByTagName("p");
            for (var j = 0; j < author_series.length; j++) {
                var text = author_series[j].innerText;
                if (text.length != 0) {
                    result += '\n' + text;
                }
            }
            result += '\n\n';
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

