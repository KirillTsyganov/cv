document.addEventListener('DOMContentLoaded', () => {
    const bodyArea = document.body;

    if (!bodyArea) {
        console.error('Error: Element with id "content" not found.');
        return;
    }

    fetch('cv.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(markdown => {
            const cv = parseMarkdown(markdown);
            const headerHTML = document.getElementById('cv-header');

            headerHTML.innerHTML = `<h1 id='cv-header-header'>${cv['header']['name']}</h1>
                                <p id='cv-header-aboutme'>${cv['header']['aboutme']}</p>
                                <p id='cv-header-contact'>${cv['header']['mobile']} | ${cv['header']['email']} | <a href='https://${cv['header']['github']}'>GitHub</a> | <a href='https://${cv['header']['linkedin']}'>LinkedIn</a></p>`;

            const skillsHTML = document.getElementById('cv-skills');

            skillsHTML.innerHTML = `<h1 id='cv-skills-header'>Skills and Attributes</h2>
                                    <table id='cv-skills-table'><tbody id='cv-skills-table-body'></tbody></table>`;
            const skillsHTMLtable = document.getElementById('cv-skills-table-body');

            cv['skills'] && Object.keys(cv['skills']).forEach(skillKey => {
                skillsHTMLtable.innerHTML += `<tr><th>${skillKey}</th><th>${cv['skills'][skillKey]}</th></tr>`
            });

            const experienceHTML = document.getElementById('cv-experience');

            experienceHTML.innerHTML = `<h1 id='cv-experience-header'>Professional Experience</h1>`;
            cv['experience'] && cv['experience'].forEach(jobExp => {
                let jobExpHTML = `<div class='cv-experience-job'>
                                  <div class='cv-experience-job-header'>
                                    <p class='cv-experience-job-title'>${jobExp[0]}</p>
                                    <div class="cv-experience-job-meta">
                                        <p class='cv-experience-job-company'>${jobExp[1]}</p>
                                        <p class='cv-experience-job-length'>${jobExp[2]}</p>
                                    </div>
                                  </div>
                                  <ul class='cv-experience-job-descriptions'>`;

                for (let i = 3; i < jobExp.length; i++) {
                    jobExpHTML += `<li class='cv-experience-job-description'>${jobExp[i]}</li>`;
                }

                jobExpHTML += `</ul></div>`;
                experienceHTML.innerHTML += jobExpHTML;
            });

            const projectsHTML = document.getElementById('cv-projects');

            projectsHTML.innerHTML = `<h1 id='cv-projects-header'>Selected Projects</h1>`;
            console.log(cv['projects']);
            cv['projects'] && cv['projects'].forEach(project => {
                let projectHTML = `<div class='cv-projects-project'>
                                     <div class='cv-projects-project-header'>
                                      <p class='cv-projects-project-title'>${project[0]}</p>
                                      <p class='cv-projects-project-company'>(${project[1]})</p>
                                    </div>
                                    <div>
                                      <p id='cv-projects-project-summary'>${project[2]}</p>
                                    </div>
                                  <ul class='cv-projects-project-descriptions'>`;

                for (let i = 2; i < project.length; i++) {
                    projectHTML += `<li class='cv-projects-project-description'>${project[i]}</li>`;
                }

                projectHTML += `</ul></div>`;
                projectsHTML.innerHTML += projectHTML;
            });

            const educationHTML = document.getElementById('cv-education');

            educationHTML.innerHTML = `<h1 id='cv-education-header'>Education</h1>`;
            cv['education'] && cv['education'].forEach(edu => {
                educationHTML.innerHTML += `<div class='cv-education-degree'>
                                            <p class='cv-education-degree-name'>${edu[0]}</p>
                                            <p class='cv-education-degree-university'>${edu[1]}</p>
                                            <p class='cv-education-degree-discipline'>${edu[2]}</p>
                                          </div>`;
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing markdown file:', error);
        });
});

function parseMarkdown(markdown) {
    const lines = markdown.split('\n');
    const cv = {};

    let cvHeader = false;
    let cvSkills = false;
    let cvExperience = false;
    let cvProjects = false;
    let cvEducation = false;

    let newHeader = false;
    const newJobExp = [];

    const pastProjects = [];

    for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('###')) newHeader = true;

        if (line.startsWith('---') && !cvHeader) {
            cv['header'] = {};
            cvHeader = true;
            cvSkills = false;
            cvExperience = false;
            cvProjects = false;
            cvEducation = false;
            continue;
        } else if (line.startsWith('## Skills')) {
            cv['skills'] = {};
            cvHeader = false;
            cvSkills = true;
            cvExperience = false;
            cvProjects = false;
            cvEducation = false;
            continue;
        } else if (line.startsWith('## Professional Experience')) {
            cv['experience'] = [];
            cvHeader = false;
            cvSkills = false;
            cvExperience = true;
            cvProjects = false;
            cvEducation = false;
            continue;
        } else if (line.startsWith('## Selected Projects')) {
            cv['projects'] = [];
            cvHeader = false;
            cvSkills = false;
            cvExperience = false;
            cvProjects = true;
            cvEducation = false;
            continue;
        } else if (line.startsWith('## Education')) {
            cv['education'] = [];
            cvHeader = false;
            cvSkills = false;
            cvExperience = false;
            cvProjects = false;
            cvEducation = true;
            continue;
        }

        if (cvHeader) {
            if (line.startsWith('---')) {
                cvHeader = false;
                continue;
            }
            const [key, value] = line.split(':').map(part => part.trim());
            // Handle cases where a value might contain a colon
            cv['header'][key] = line.substring(line.indexOf(':') + 1).trim();
        } else if (cvSkills) {
            const [key, value] = line.split('|').map(part => part.trim());
            cv['skills'][key] = value;
        } else if (cvExperience) {
            if (newHeader && newJobExp.length > 0) {
                cv['experience'].push(newJobExp.slice());
                newJobExp.length = 0; // Clear the array
            }
            if (newHeader) {
                newJob = line.replace('###', '').trim();
                const [jobTitle, companyName, lengthOfWork] = newJob.split('|').map(part => part.trim());
                newJobExp.push(jobTitle, companyName, lengthOfWork);
                newHeader = false;
            }
            if (line.startsWith('-')) {
                const jobDesc = line.replace('-', '').trim();
                newJobExp.push(jobDesc);
            }
        } else if (cvProjects) {
            if (newHeader && pastProjects.length > 0) {
                cv['projects'].push(pastProjects.slice());
                pastProjects.length = 0;
            }
            if (newHeader) {
                pastProject = line.replace('###', '').trim();
                const [projectName, companyName] = pastProject.split('|').map(part => part.trim());
                pastProjects.push(projectName, companyName);
                newHeader = false;
            }
            if(line.startsWith('>')) {
                const projectDesc = line.replace('>', '').trim();
                pastProjects.push(projectDesc);
            }
            if (line.startsWith('-')) {
                const projectDesc = line.replace('-', '').trim();
                pastProjects.push(projectDesc);
            }
        } else if (cvEducation) {
            if (line.startsWith('-')) {
                const eduDesc = line.replace('-', '').trim();
                const [degreeName, uniName, disciplineName] = eduDesc.split('|').map(part => part.trim());
                cv['education'].push([degreeName, uniName, disciplineName]);
            }
        }
    }

    // After the loop, push the last collected job experience
    if (newJobExp.length > 0) {
        cv['experience'].push(newJobExp.slice());
    }
    if (pastProjects.length > 0) {
        cv['projects'].push(pastProjects.slice());
    }

    return cv;
}