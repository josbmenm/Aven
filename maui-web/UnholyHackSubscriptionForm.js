import React from 'react';

const css = `

#mc_embed_signup {
  margin-left: -8px;
  margin-right: -8px;
  display: flex;
}
#mc_embed_signup_scroll {
  display: flex;
}
#mce-responses {
  display: none;
}
.mc-field-group {
  position: relative;
  padding-right: 42px;
  flex: 6 1 auto;
}
@media (min-width: 640px) {
  .mc-field-group {
    padding-right: 56px;
  }
}
label[for='mce-EMAIL'] {
  font-family: Maax;
  font-size: 15px;
  line-height: 22px;
  position: absolute;
  top: 0;
  padding: 12px 16px 16px 16px;
  transition: -webkit-transform 150ms ease;
  transition: transform 150ms ease;
  transition: transform 150ms ease, -webkit-transform 150ms ease;
  -webkit-transform: scale(1) translate3d(0, 0, 0);
  transform: scale(1) translate3d(0, 0, 0);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  text-transform: lowercase;
  color: #99b9b9;
}
@media (min-width: 640px) {
  label[for='mce-EMAIL'] {
    font-size: 18px;
    line-height: 28px;
    padding: 16px 20px 14px 20px;
  }
}
.clear {
  flex: 1 0 auto;
}
.email {
  font-family: Maax;
  font-size: 15px;
  line-height: 22px;
  display: block;
  width: 100%;
  margin: 0;
  padding: 18px 16px 8px 16px;
  transition: box-shadow 150ms ease;
  color: #005151;
  border: 0;
  border-radius: 4px;
  box-shadow: inset 0 0 0 4px #669797;
  -webkit-appearance: none;
}
.email::-webkit-input-placeholder {
  color: #99b9b9;
}
.email:-ms-input-placeholder {
  color: #99b9b9;
}
.email::-ms-input-placeholder {
  color: #99b9b9;
}
.email::placeholder {
  color: #99b9b9;
}
.email:focus {
  outline: 0;
  box-shadow: inset 0 0 0 4px #669797, 0 0 0 4px #ccdcdc;
}
@media (min-width: 640px) {
  .email {
    font-size: 18px;
    line-height: 28px;
    padding: 24px 20px 8px 20px;
  }
}
.button {
  font-family: 'Maax-Bold';
  font-size: 15px;
  line-height: 22px;
  width: 100%;
  margin: 0;
  padding: 12px 16px 14px 16px;
  cursor: pointer;
  transition: background-color 150ms ease, box-shadow 150ms ease;
  letter-spacing: 0.3;
  text-transform: lowercase;
  color: #fff;
  border: none;
  border-radius: 4px;
  background-color: #337474;
  -webkit-appearance: button;
}
.button:focus {
  outline: 0;
  background-color: #4d8585;
  box-shadow: 0 0 0 4px #ccdcdc;
}
.button:active:focus {
  background-color: #1a6262;
  box-shadow: none;
}
.button:hover {
  background-color: #4d8585;
}
@media (min-width: 640px) {
  .button {
    font-size: 24px;
    line-height: 28px;
    padding: 14px 32px 18px 32px;
  }
}
.email.filled + label[for='mce-EMAIL'],
.email:focus + label[for='mce-EMAIL'] {
  -webkit-transform: scale(0.65) translate3d(12px, -4px, 0);
  transform: scale(0.65) translate3d(12px, -4px, 0);
}
`;

const html = `

<!-- Begin Mailchimp Signup Form -->
<div id="mc_embed_signup">
<form action="https://onofood.us18.list-manage.com/subscribe/post?u=87f353e4bf17adebb83d8db1a&amp;id=cdd5752309" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank">
    <div id="mc_embed_signup_scroll">
  
<div class="mc-field-group">
  <input type="email" value="" required name="EMAIL" class="required email" id="mce-EMAIL">
  <label for="mce-EMAIL">Your Email </label>
</div>
  <div id="mce-responses" class="clear">
    <div class="response" id="mce-error-response" style="display:none"></div>
    <div class="response" id="mce-success-response" style="display:none"></div>
  </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
    <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_87f353e4bf17adebb83d8db1a_cdd5752309" tabindex="-1" value=""></div>
    <div class="clear"><input type="submit" value="Get Updates" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
    </div>
</form>
</div>

<script>
// For input label
var input = document.querySelector("#mce-EMAIL");

input.addEventListener('change', function(e) {
  if (e.target.value.length > 0) {
    e.target.classList.add('filled');
  } else {
    if (e.target.classList.contains('filled')) { e.target.classList.remove('filled'); }
  }
})

// For proper height on mobile
var doSetHeight = function() {
  var vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
}

doSetHeight();

window.addEventListener('resize', () => {
  doSetHeight();
});
</script>
`;

export default function UnholyHackSubscriptionForm() {
  const __html = `
    <span>
      <style>${css}</style>
      ${html}
    </span>
  `;
  return <div dangerouslySetInnerHTML={{ __html }} />;
}
