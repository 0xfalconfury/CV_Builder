function downloadPDF(){
 const page=document.getElementById("resumePage");
 if(!page||!page.innerText.trim()){showToast("Add some information before exporting.");return}
 document.title=(cvData.name?cvData.name.replace(/[^a-z0-9]+/gi,"-").toLowerCase():"my")+"-cv";
 window.print();
}
