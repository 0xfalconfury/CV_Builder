function safeText(v){return escapeHTML(v||"")}
function lineList(text){return (text||"").split(/\n|,/).map(x=>x.trim()).filter(Boolean)}
function contactHTML(d){return [d.email,d.phone,d.location,d.dateOfBirth?"DOB: "+d.dateOfBirth:"",d.nationality?"Nationality: "+d.nationality:"",d.website,d.linkedin,d.github,d.otherLink].filter(Boolean).map(safeText).join('<span>•</span>')}
function section(title,body){return body?`<section class="resume-section"><h3>${title}</h3>${body}</section>`:""}
function itemHTML(item,kind){
 const title=item.role||item.degree||item.name||"";
 const sub=[item.company||item.institution,item.department,item.location,item.employmentType].filter(Boolean).map(safeText).join(" · ");
 const date=safeText([item.startDate,item.endDate].filter(Boolean).join(" – ")||item.date||[item.startYear,item.endYear].filter(Boolean).join(" – "));
 const desc=safeText([item.result?"Result: "+item.result:"",item.technologies?"Technologies: "+item.technologies:"",item.description||item.details].filter(Boolean).join("\n"));
 return `<div class="resume-item"><div class="resume-item-top"><span>${safeText(title)}</span><span>${date}</span></div>${sub?`<div class="resume-item-sub">${sub}</div>`:""}${desc?`<div class="resume-item-desc">${desc}</div>`:""}${kind==="projects"&&item.link?`<div class="resume-item-sub">${safeText(item.link)}</div>`:""}</div>`;
}
function buildResume(data,template){
 const photo=data.photo?`<img class="resume-photo" src="${data.photo}" alt="Profile photo">`:"";
 const header=`<header class="resume-header">${photo}<div><h1 class="resume-name">${safeText(data.name||"Your Name")}</h1><p class="resume-role">${safeText(data.title||"Professional Title")}</p><div class="resume-contact">${contactHTML(data)}</div></div></header>`;
 const summary=section("Profile",[data.summary,data.careerObjective?"Career objective: "+data.careerObjective:""].filter(Boolean).length?`<p>${safeText([data.summary,data.careerObjective?"Career objective: "+data.careerObjective:""].filter(Boolean).join("\n\n"))}</p>`:"");
 const exp=section("Experience",(data.experience||[]).map(x=>itemHTML(x,"experience")).join(""));
 const edu=section("Education",(data.education||[]).map(x=>itemHTML(x,"education")).join(""));
 const skillsArr=[...lineList(data.technicalSkills),...lineList(data.softSkills),...lineList(data.skills)];
 const skills=section("Skills",skillsArr.length?`<div class="resume-skills">${skillsArr.map(s=>`<span class="resume-skill">${safeText(s)}</span>`).join("")}</div>`:"");
 const langs=section("Languages",data.languages?`<p>${safeText(data.languages)}</p>`:"");
 const customGroups={};(data.customFields||[]).filter(x=>x.visible!==false&&x.label&&x.value).forEach(x=>{const key=x.section||"Additional information";(customGroups[key] ||= []).push(x)});
 const customHTML=Object.entries(customGroups).map(([heading,items])=>section(heading,items.map(x=>`<div class="resume-item"><div class="resume-item-top"><span>${safeText(x.label)}</span></div><div class="resume-item-desc">${x.type==="url"?safeText(x.value):safeText(x.value)}</div></div>`).join(""))).join("");
 const projects=section("Projects",(data.projects||[]).map(x=>itemHTML(x,"projects")).join(""));
 const certs=section("Certifications",data.certifications?`<p>${safeText(data.certifications)}</p>`:"");
 const awards=section("Awards & achievements",data.awards?`<p>${safeText(data.awards)}</p>`:"");
 const refs=section("References",data.references?`<p>${safeText(data.references)}</p>`:"");
 if(template==="modern"){
   return `<div class="modern-side">${photo}<h1 class="resume-name">${safeText(data.name||"Your Name")}</h1><p class="resume-role">${safeText(data.title||"Professional Title")}</p>${section("Contact",`<p>${[data.email,data.phone,data.location,data.dateOfBirth?"DOB: "+data.dateOfBirth:"",data.nationality?"Nationality: "+data.nationality:"",data.website,data.linkedin,data.github,data.otherLink].filter(Boolean).map(safeText).join("<br>")}</p>`)}${skills}${langs}${certs}</div><div class="modern-main">${summary}${exp}${edu}${projects}${awards}${refs}${customHTML}</div>`;
 }
 const top=template==="ats"?header.replace(photo,""):header;
 if(template==="creative") return `${top}${summary}<div class="resume-columns"><div>${exp}${projects}${customHTML}</div><div>${skills}${edu}${langs}${certs}${awards}${refs}</div></div>`;
 if(template==="executive") return `${top}${summary}${exp}${edu}<div class="resume-columns"><div>${projects}${awards}${customHTML}</div><div>${skills}${langs}${certs}${refs}</div></div>`;
 return `${top}${summary}${exp}${edu}${projects}${skills}${langs}${certs}${awards}${refs}${customHTML}`;
}
function renderResume(data,template){
 const page=document.getElementById("resumePage");
 page.className=`resume-page template-${template}`;
 const hasContent=[data.name,data.title,data.summary,data.email,data.phone,(data.experience||[]).length,(data.education||[]).length,data.skills,data.technicalSkills,data.softSkills,(data.customFields||[]).some(x=>x.value)].some(Boolean);
 if(!hasContent){page.innerHTML=`<div class="resume-empty"><div class="empty-icon">✦</div><h2>Your CV starts here</h2><p>Add your name and details to see your resume take shape.</p></div>`;return}
 page.innerHTML=buildResume(data,template);
}
