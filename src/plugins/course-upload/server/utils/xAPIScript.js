const xAPIFunctionScript = `
var PROGRESSED = "http://adlnet.gov/expapi/verbs/progressed";
// xAPI Tracking function
function sendXAPIStatement(source, stm) {
  try {
    window.parent.postMessage(
      { source: source, data: stm },
      '${process.env.CLIENT_PRODUCTION_URL}'
    );
    window.parent.postMessage(
      { source: source, data: stm },
    );
    window.parent.postMessage(
      { source: source, data: stm },
      '${process.env.CLIENT_LOCAL_URL}'
    );
  } catch (error) {
    console.log("xAPI Error:" + error);
  }
}
// xAPI Tracking function`;

const xAPIScript = `
function sendStatement(attribs) {
// xAPI Tracking Code for myFullerEquip
sendXAPIStatement('articulateCourse', createStatement(attribs));
// xAPI Tracking Code for myFullerEquip`;

const xAPIBookMarkScript = `
function SetBookmark(data) {
// xAPI Bookmark Tracking Code for myFullerEquip
sendXAPIStatement('articulateCourseBookmark', data);
// xAPI Bookmark Tracking Code for myFullerEquip`;

const hotJarScript = `
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

const missionControlScript = `
<!-- Mission Control -->
<script src="https://platformcargo.fuller.edu/control/mission-control.js" type="module"></script>
<!-- /Mission Control -->
`;

module.exports = {
  xAPIScript,
  hotJarScript,
  missionControlScript,
  xAPIBookMarkScript,
  xAPIFunctionScript,
};
