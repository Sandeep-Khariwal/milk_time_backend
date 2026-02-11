

export const PrivacyPloicy = ()=>{

    return (
        `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Milk Bill - Privacy Policy</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              background-color: #f9f9f9;
              color: #333;
          }
          h1, h2 {
              color: #2c3e50;
          }
          .container {
              background: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          ul {
              margin-left: 20px;
          }
          .footer {
              margin-top: 40px;
              font-size: 14px;
              color: #777;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Privacy Policy</h1>
          <p><strong>Last Updated:</strong> ${new Date().toDateString()}</p>

          <p>Welcome to <strong>Milk Bill</strong>. Your privacy is important to us. 
          This Privacy Policy explains how we collect, use, store, and protect your information when you use our mobile application.</p>

          <h2>1. Information We Collect</h2>

          <h3>a) Personal Information</h3>
          <ul>
              <li>Name</li>
              <li>Phone Number</li>
              <li>Business/Firm Name</li>
          </ul>

          <h3>b) Business Data</h3>
          <ul>
              <li>Milk entry records (weight, fat, rate, amount)</li>
              <li>Customer details</li>
              <li>Payment and billing records</li>
              <li>Transaction history</li>
          </ul>

          <h3>c) Device Information</h3>
          <ul>
              <li>Device type</li>
              <li>Operating system</li>
              <li>App usage data for performance improvement</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
              <li>To manage milk collection and billing records</li>
              <li>To generate invoices and reports</li>
              <li>To improve app performance and user experience</li>
              <li>To provide customer support</li>
              <li>To ensure security and prevent fraud</li>
          </ul>
          <p>We do <strong>not sell or rent</strong> your personal information to third parties.</p>

          <h2>3. Data Storage and Security</h2>
          <p>Your data is stored securely using protected databases. 
          We take appropriate technical and security measures to protect your information. 
          However, no method of electronic storage is 100% secure.</p>

          <h2>4. Data Sharing</h2>
          <p>We do not share your data with third parties except when required by law or to protect our legal rights.</p>

          <h2>5. Data Retention</h2>
          <p>We retain your data as long as your account is active. 
          You may request deletion of your data at any time.</p>

          <h2>6. User Rights</h2>
          <ul>
              <li>Access your stored data</li>
              <li>Request correction of incorrect information</li>
              <li>Request deletion of your account and data</li>
          </ul>

          <h2>7. Children's Privacy</h2>
          <p>Milk Bill is not intended for children under 13 years of age. 
          We do not knowingly collect personal information from children.</p>

          <h2>8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. 
          Changes will be posted on this page with an updated date.</p>

          <h2>9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, contact us at:</p>
          <p><strong>Email:</strong> milkbill5788@gmail.com</p>
          <p><strong>App Name:</strong> Milk Bill</p>
          <p><strong>Country:</strong> India</p>

          <div class="footer">
              © ${new Date().getFullYear()} Milk Bill. All Rights Reserved.
          </div>
      </div>
  </body>
  </html>
  `
    )
}