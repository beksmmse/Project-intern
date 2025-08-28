<template>
    <div class="contact-wrapper">
      <div class="contact-box">
        <div class="contact-left">
          <h2>ติดต่อเราได้ที่</h2>
            <p>
                63/4  ซอย สรรพาวุธ 2 แขวงบางนาเหนือ <br>
                เขตบางนา กรุงเทพมหานคร 10260
            </p>
          <ul class="contact-list">
            <li>
              <i class="fab fa-facebook" style="color: #3b5998;"></i>
              <a href="https://www.facebook.com/deemaptdm" target="_blank">deemaptdm</a>
            </li>
            <li>
              <i class="fab fa-youtube" style="color: #FF0000;"></i>
              <a href="https://www.youtube.com/@ThaiDigitalMap" target="_blank">@ThaiDigitalMap</a>
            </li>
            <li>
              <i class="fab fa-line" style="color: #00c300;"></i>
              <a href="#" target="_blank">@tdmgis</a>
            </li>
            <li>
              <i class="fas fa-envelope" style="color: #D44638;"></i>
              <a href="mailto:info@tdm.in.th">info@tdm.in.th</a>
            </li>
            <li>
              <i class="fas fa-phone" style="color: #333;"></i>
              <a href="tel:+6620224994">02-022-4994 #2</a>
            </li>
            <li>
              <i class="fa-solid fa-window-maximize" style="color: #333;"></i>
              <a href="https://tdm.in.th/">tdm.in.th</a>
            </li>
          </ul>
        </div>
  
        <div class="contact-right">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124054.00069553514!2d100.45936334335937!3d13.676755100000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2a1e8b0e41f93%3A0xb4eb7273a15204bf!2z4Lia4Lij4Li04Lip4Lix4LiXIOC5hOC4l-C4oiDguJTguLTguIjguLTguJfguLHguKUg4LmB4Lih4LieIOC4iOC4s-C4geC4seC4lA!5e0!3m2!1sth!2sth!4v1746498857687!5m2!1sth!2sth"
            width="100%"
            height="100%"
            style="border:0;"
            loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </div>
  </template>
  

<style scoped>
.contact-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  background: #f4f7fa;
  font-family: sans-serif;
}

.contact-box {
  display: flex;
  flex-wrap: wrap;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  max-width: 960px;
  width: 100%;
  overflow: hidden;
}

.contact-left,
.contact-right {
  flex: 1 1 400px;
  padding: 30px;
  box-sizing: border-box;
}

.contact-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.address {
  font-size: 14px;
  color: #555;
  margin-bottom: 24px;
  line-height: 1.6;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-list li {
  margin: 14px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-list i {
  font-size: 22px;
  width: 24px;
}

.contact-list a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s ease;
}

.contact-list a:hover {
  color: #007BFF;
}

.contact-right iframe {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

@media (max-width: 768px) {
  .contact-box {
    flex-direction: column;
  }

  .contact-left,
  .contact-right {
    padding: 20px;
  }

  h2 {
    font-size: 20px;
  }
}
</style>