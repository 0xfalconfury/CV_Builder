const STORAGE_KEY = "formacv.document.v1";
const defaultData = {
  name:"",title:"",email:"",phone:"",location:"",dateOfBirth:"",nationality:"",website:"",linkedin:"",github:"",otherLink:"",summary:"",careerObjective:"",
  technicalSkills:"",softSkills:"",skills:"",languages:"",certifications:"",awards:"",references:"",photo:"",
  experience:[],education:[],projects:[],customFields:[]
};
function loadCV(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?{...structuredClone(defaultData),...JSON.parse(raw)}:structuredClone(defaultData)}catch(e){console.warn("Could not load saved CV",e);return structuredClone(defaultData)}}
function saveCV(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true}catch(e){console.warn("Could not save CV",e);return false}}
