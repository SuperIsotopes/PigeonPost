// Builds the HTML for the "Pigeon Post" email.
// Table-based layout + inline styles on purpose: this is what actually
// survives Gmail, Outlook, and Apple Mail's varying levels of CSS support.
// The pigeon and scroll-roller graphics are attached as CID images (see
// index.js) rather than linked or base64-inlined, because that's the
// combination most email clients render reliably.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPigeonEmail({ message, fromName }) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const safeFrom = fromName ? escapeHtml(fromName) : "";
  const signOff = safeFrom
    ? `&mdash; carried by pigeon, sent by ${safeFrom}`
    : `&mdash; carried by pigeon`;

  const subject = safeFrom
    ? `A message from ${safeFrom}, by pigeon`
    : `A message by pigeon`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#dfeaf0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#dfeaf0; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%;">

          <!-- pigeon -->
          <tr>
            <td align="center" style="padding-bottom:4px;">
              <img src="cid:pigeon-image" width="140" height="140" alt="A cartoon carrier pigeon" style="display:block; width:140px; height:140px;">
            </td>
          </tr>

          <!-- scroll top roller -->
          <tr>
            <td style="padding:0;">
              <img src="cid:scroll-top-image" width="480" style="display:block; width:100%; height:auto;" alt="">
            </td>
          </tr>

          <!-- parchment body with the message -->
          <tr>
            <td style="background-color:#faf6ec; padding:28px 34px; border-left:1px solid #d8cfb3; border-right:1px solid #d8cfb3;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:17px; line-height:1.65; color:#1d2b4f;">
                    ${safeMessage}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:22px; font-family:'Courier New', Courier, monospace; font-size:13px; color:#4d5a7a;">
                    ${signOff}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- scroll bottom roller -->
          <tr>
            <td style="padding:0;">
              <img src="cid:scroll-bottom-image" width="480" style="display:block; width:100%; height:auto;" alt="">
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td align="center" style="padding-top:22px; font-family:'Courier New', Courier, monospace; font-size:11px; color:#4d5a7a; opacity:0.75;">
              Delivered by wing, not wifi &middot; sent via Pigeon Post
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `${message}\n\n${safeFrom ? `-- carried by pigeon, sent by ${fromName}` : "-- carried by pigeon"}\n(Delivered by wing, not wifi -- sent via Pigeon Post)`;

  return { subject, html, text };
}

module.exports = { buildPigeonEmail };
