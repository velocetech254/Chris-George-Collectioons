# Chris George Collections

A responsive, backend-free storefront. Checkout sends the customer's bag directly from the browser to [Web3Forms](https://web3forms.com/), which emails the order to `edwinmwenda252@gmail.com`.

## Set up order email

1. Create a form at [Web3Forms](https://web3forms.com/) using `edwinmwenda252@gmail.com` as the inbox that receives submissions. Verify the inbox if requested, then copy the form's access key.
2. Open `web3forms-config.js` and paste the access key into `accessKey`:

   ```js
   window.WEB3FORMS_CONFIG = Object.freeze({
     accessKey: "PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE"
   });
   ```

3. Publish `index.html`, `styles.css`, `script.js`, `web3forms-config.js`, and `Logo.jpeg` on an HTTPS static host. No Node.js server, `.env` file, API backend, or build step is required. Test from the hosted website; browser restrictions may prevent requests from a local `file://` page.
4. Place a test order, then check the inbox and Web3Forms submissions dashboard. The buyer's email is included as Reply-To, so you can reply to them. The sending address belongs to the form/email service and is not the buyer's address.

Orders include the customer's name, phone, email, order reference, product names, selected KSh prices, subtotal, and product image URLs. This implementation sends the images as links in the email text, not as image attachments. Some email applications may not show remote images automatically.

Web3Forms is a third-party service with a free plan and usage limits; check its current terms and quotas. Its access key must be present in the browser for a backend-free integration, so it is public—not a password. Enable the service's available spam controls, do not put private credentials in the site, and check the provider dashboard if a buyer reports that an order email is missing. An accepted submission does not guarantee inbox delivery.

If automatic submission is unconfigured or fails, checkout provides a prefilled `mailto:` fallback. That opens the buyer's email app and requires them to send the order manually.

Product prices are illustrative KSh values in `script.js`; update them to your real prices before launch.
