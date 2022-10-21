function isValidURL() {
    let valid = new Promise(function(resolve, reject) {
        browser.tabs        
            .query({ active: true, currentWindow: true })
            .then((tabs) => {
                var url = tabs[0].url;
                const valid_urls = [
                    'https://app.thestorygraph.com/to-read',
                    'https://app.thestorygraph.com/owned-books',
                    'https://app.thestorygraph.com/currently-reading',
                    'https://app.thestorygraph.com/books-read',
                ]
                for (const prefix of valid_urls) {
                    if (url.startsWith(prefix)) {
                        resolve('valid url');
                    }
                }
                reject('invalid url');
            });
    });
    return valid;
}

function getOptions() {
    return {
        series: document.querySelector('#opt-series').checked,
        sgtags: document.querySelector('#opt-sgtags').checked,
        usertags: document.querySelector('#opt-usertags').checked,
        url: document.querySelector('#opt-url').checked
    }
}


function temporaryExportedMessage(id) {
    var element = document.getElementById(id);
    var origText = element.innerHTML;
    element.innerHTML = "Exported!";
    setTimeout((message, elem) => {
            elem.innerText = message;
        },
        1000,
        origText,
        element
    );
}
/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {


    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function exportclip(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "sgexportclip",
          options: getOptions(),
        }).then(() => {
            temporaryExportedMessage("sgexportclip")
        });
    }
    function exportdl(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "sgexportdl",
          options: getOptions(),
        }).then(() => {
            temporaryExportedMessage("sgexportdl")
        });
    }


    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not export: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    if (e.target.id === "sgexportclip") {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(exportclip)
        .catch(reportError);
    } else if (e.target.id === "sgexportdl") {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(exportdl)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError() {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  //console.error(`Failed to execute sgexport content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
isValidURL().then(() => {
    browser.tabs
        .executeScript({ file: "/content_scripts/export.js" })
        .then(listenForClicks)
        .catch(reportExecuteScriptError);
}).catch(() => {
    reportExecuteScriptError();
});

