const GMAIL_URL_PREFIX = "https://www.google.com/url?q=";

const ALLOWED_PREFIXES = [
    'https://deriv.com/',
    'https://mail.google.com/',
    'https://clickup.com/',
    'https://github.com/binary-com/',
];

function sanitizeInput(input) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return input.replace(reg, (match) => (map[match]));
}
function showConfirm(prompt, confirmCallback, rejectCallback) {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.id = 'customOverlay';
    overlay.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    `;

    // Create the popup
    const popup = document.createElement('div');
    popup.id = 'customConfirm';
    popup.style.cssText = `
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        border: 1px solid #ccc;
        padding: 20px;
        width: auto;
        max-width: 500px;
        text-align: center;
    `; // Removed z-index from here as it's now redundant

    // Add content to the popup
    popup.innerHTML = `
      <p style="margin-bottom: 20px;">${prompt}</p>
      ${confirmCallback ? '<button id="confirmYes" style="margin-right: 10px;">Yes</button>' : ''}
      ${rejectCallback ? '<button id="confirmNo">No</button>' : ''}
    `;
  
    // Append popup to overlay, then overlay to body
    overlay.appendChild(popup); // This line is changed
    document.body.appendChild(overlay);
  
    // Function to remove popup
    function removePopup() {
        document.body.removeChild(overlay);
    }
  
    // Enhanced event handling
    overlay.addEventListener('click', function(event) {
        if (event.target.id === 'confirmYes') {
            confirmCallback && confirmCallback();
            removePopup();
        } else if (event.target.id === 'confirmNo') {
            rejectCallback && rejectCallback();
            removePopup();
        }
    });
}



document.addEventListener("click", function(event) {
    const targetElement  = event.target;

    if (targetElement.tagName === 'A') {

        // Get the url from the A element and strip off the PREFIX_LENGTH and acquire the domain name
        let href   = targetElement.getAttribute('href');

        // if URL starts from gmail redirect, then extract the actual url
        if (href.startsWith(GMAIL_URL_PREFIX)) {
            href = href.slice(GMAIL_URL_PREFIX.length);
            href = decodeURIComponent(href);
        }

        let url;
        let domain;

        // try to convert it to URL, if it fails, then its invalid and just block it just in case
        try {
            url    = new URL(href.toString());
            domain = url.host;
        } catch (e) {
            // TODO: are there any urls which are considered invalid but still should be clickable?
            // e.g. some special protocols / app-specific urls etc,
            event.preventDefault();
            showConfirm('Invalid URL, recommendation is to not proceed. Click "Yes" to proceed anyway.',
                () => {
                    window.open(href, '_blank');
                },
                () => {});
            return;
        }
        
        const allowed   = ALLOWED_PREFIXES.some(prefix => href.startsWith(prefix));

        // if its on allow list, allow
        if (allowed) {
            return;
        }

        // prompt with sanitized domain - just in case, everything coming from user should be sanitized
        const propmt = `Are you sure you want to go there?<br/><br/>  <b>${sanitizeInput(domain)}</b>`
    
        // Prevent and alert
        showConfirm(propmt, () => {
            window.open(href, '_blank');
        }, () => {});

        event.preventDefault();
    }
});