export const xAPIScriptFunction = `
// xAPI Tracking function
function sendXAPIStatement(source, stm) {
  try {
    window.parent.postMessage(
      { source: source, data: stm },
      "https://myfullerequip.com"
    );
    window.parent.postMessage(
      { source: source, data: stm },
      "https://walrus-app-7eevm.ondigitalocean.app"
    );
    window.parent.postMessage(
      { source: source, data: stm },
      "http://127.0.0.1:3000"
    );
  } catch (error) {
    console.log("xAPI Error:" + error);
  }
}
// xAPI Tracking function`;

export const xAPIScript = `
// xAPI Tracking Code for myFullerEquip
sendXAPIStatement('articulateCourse', createStatement(attribs));
// xAPI Tracking Code for myFullerEquip`;

export const xAPIBookMarkScript = `
// xAPI Bookmark Tracking Code for myFullerEquip
sendXAPIStatement('articulateCourseBookmark', data);
// xAPI Bookmark Tracking Code for myFullerEquip`;

export const hotJarScript = `
  <!-- Hotjar Tracking Code for myFullerEquip -->
  <script>
      (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:3730267,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  </script>
  <!-- Hotjar Tracking Code for myFullerEquip -->`;

export const missionControlScript = `
  <!-- Mission Control -->
  <script src="https://platformcargo.fuller.edu/control/mission-control.js" type="module"></script>
  <!-- /Mission Control -->
  `;
