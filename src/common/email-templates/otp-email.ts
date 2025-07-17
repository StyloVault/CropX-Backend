export const OtpEmailTemplate = (templateData) => {
  const html = `
  <!DOCTYPE html>
  <html lang="eng">
  ​
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style type="text/css">
          body,
          html {
              width: 100%;
              min-height: 100%;
              margin: 0;
              background: #F1F5F9;
              font-family: "Avenir", sans-serif;
          }
          .center {
              width: 600px;
          }
          * {
                      box-sizing:border-box;
          }
          .content {
                      padding: 45px;
          }
          .heading {
                      font-size: 20px;
          }
          .text {
                      font-size: 16px;
          }
          @media only screen and (max-width: 540px) {
            .top {
              padding: 35px 10px !important;
              font-size: 18px !important;
            }
            .center {
                width: 100% !important;
            }
            .content {
              padding: 25px 15px !important;
            }
            .heading {
              font-size: 17px !important;
            }
            .text {
              font-size: 13px !important;
            }
            .image {
              width: 80px !important;
              height: 80px !important;
              top: -70px !important;
            }
          }
      </style>
  </head>
  ​
  <body>
      <center class="center" style="height: 100%; margin: 0 auto;">
          <table style="width: 100%;height: 200px;">
              <tr style="background-color: #0b225d;">
                  <td class="top" style="padding: 35px;">
                      <table>
                          <tr>
                              <td style="padding: 0 0 20px 0;">
                                  <img style="width: 60px;" src="https://res.cloudinary.com/sudo-africa/image/upload/v1636582708/SudoEmailImages/__udo-white_gadq2u.png" alt="logo"/>
                              </td>
                          </tr>
                      </table>
                      <table style="width:100%;margin: 10px auto;">
                          <tr>
                              <td class="top" style="font-size: 22px;color:white;font-weight: 800;text-align:center; padding-bottom:20px;">
                              ${templateData.title}
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
          <table class="content" style="width: 100%; min-height: 300px;background-color: white;">
              <tr>
                  <td style="padding-bottom:10px;text-align: center;position: relative;height: 50px; overflow: visible;">
                      <img class="image" style="width: 120px;height: 120px;border-radius: 50%;overflow: hidden;background: #F3F4F6;border: 2px solid #FFFFFF;margin:0 auto auto auto;position: relative;top: -100px" src="https://res.cloudinary.com/sudo-africa/image/upload/v1636582708/SudoEmailImages/mail-otp_zg4kll.png" alt="icon"/>
                  </td>
              </tr>
              <tr style="text-align: center;position: relative;">
                  <td class="heading" style="text-align: left;color: #27303F;font-weight: 800;padding-bottom: 15px;">
                  Hello ${templateData.name}!
                  </td>
              </tr>
              <tr>
                  <td class="text"
                      style="text-align: left;font-size: 16px;color: #515759;font-weight: 400;padding-bottom: 15px;line-height: 30px;">
                      Here is your one-time password to validate your login.
                  </td>
              </tr>
              <tr>
                  <td class="text"
                      style="text-align: left;padding-bottom: 15px;">
                      <span style="text-align: left;font-size: 24px;color: #252F3F;font-weight: 800;padding-bottom: 8px;line-height: 30px;letter-spacing: 0.32em;border-bottom:solid 1px #E5E7EB">
                      ${templateData.otp}
                      </span>
                      
                  </td>
              </tr>
              <tr>
                  <td class="text"
                      style="text-align: left;font-size: 16px;color: #515759;font-weight: 400;padding-bottom: 15px;line-height: 30px;">
                      If you didn’t initiate this request please review your account immediately or <a href="https://support.sudo.africa/" style="color: #0b225d;">contact our support</a> for immediate assistance  
                  </td>
              </tr>
              
              <tr>
                  <td class="text" style="color: #515759;font-weight: 400;padding-bottom: 10px;line-height: 30px;">
                      Thank you</td>
              </tr>
              <tr>
                  <td class="text" style="color: #27303F;font-weight: 800;padding-bottom: 10px;">
                      Sudo Team
                  </td>
              </tr>
              <tr>
                  <td class="text" style="color: #374151;font-weight: 400;padding-bottom: 60px;">
                      +234 903 287 128
                  </td>
              </tr>
              <tr>
                  <td>
                      <table style="width: 100%;background-color: white; padding: 20px 0;border-top:solid 1px #E5E7EB ">
                          <tr>
                              <td style="text-align:center;width: 30px; padding-bottom: 10px;">
                                  <a style="width: 25px; margin-right: 15px;text-decoration: none;" href="https://twitter.com/SudoAfrica">
                                      <img style="width: 25px;" src="https://res.cloudinary.com/sudo-africa/image/upload/v1636582709/SudoEmailImages/twitter_dk5azt.png" alt="twitter"/>
                                  </a>
                                  <a style="width: 25px; margin-right: 15px;text-decoration: none;" href="https://github.com/SudoAfrica">
                                      <img style="width: 25px;" src="https://res.cloudinary.com/sudo-africa/image/upload/v1636582709/SudoEmailImages/mail-github_nc4uvi.png" alt="github"/>
                                  </a>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center;color: #999999;font-weight: normal;font-size: 11px;padding-bottom: 5px;">
                              © ${new Date().getFullYear()} Crop Xchange Africa.
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
  ​
      </center>
  </body>
  </html>
    `;
  return html;
};
