
export const DeleteHtmlForm = () =>{

    return(
        `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Milk Bill - Delete Account</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          body {
              font-family: Arial, sans-serif;
              background: #f4f6f8;
              padding: 40px;
          }
          .container {
              max-width: 500px;
              background: white;
              padding: 30px;
              border-radius: 8px;
              margin: auto;
              box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          }
          h1 {
              text-align: center;
              color: #2c3e50;
          }
          input, textarea {
              width: 100%;
              padding: 10px;
              margin: 8px 0;
              border-radius: 5px;
              border: 1px solid #ccc;
          }
          button {
              width: 100%;
              padding: 12px;
              background: #e74c3c;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
          }
          button:hover {
              background: #c0392b;
          }
          .note {
              font-size: 14px;
              margin-bottom: 15px;
              color: #555;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Request Account Deletion</h1>
          <p class="note">
              If you wish to delete your Milk Bill account and associated data,
              please fill out the form below. Our team will process your request within 3-5 business days.
          </p>

          <form method="POST" action="/delete-account">
              <label>Full Name *</label>
              <input type="text" name="name" required />

              <label>Email Address *</label>
              <input type="email" name="email" required />

              <label>Phone Number</label>
              <input type="text" name="phone" />

              <label>Reason (Optional)</label>
              <textarea name="reason" rows="4"></textarea>

              <button type="submit">Submit Deletion Request</button>
          </form>
      </div>
  </body>
  </html>
  `
    )
}