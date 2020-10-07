/**
 * @author Vincent Berthet <vincent.berthet42@gmail.com>
 */

 //Add css for vberthet website if it exists              
var url = `/css/style.css`;
if (url != ``) { 
    $.ajax({ 
        url: url, 
        type: `HEAD`, 
        error: function()  
        { 
            console.info(`stylesheet '${url}' not found, it wont't be added to this page`);
        }, 
        success: function()  
        { 
            $(`<link href='/css/style.css' rel='stylesheet'>`).appendTo(`header`);
            console.info(`stylesheet '${url}' added dynamicaly`);
        } 
    }); 
} 

/**
 * Call after initalization to make the correct content of the page
 */
async function make(){
    //@TODO add alert if api limit exceed  
    //API
    const urlParams = new URLSearchParams(window.location.search);
    let owner = urlParams.get('u') 
    if(owner==undefined) owner='RealVincentBerthet'
    let username=document.getElementById('userName');
    username.innerHTML = owner;
    let content=document.getElementById('include');
    content.innerHTML='';

    //Get Data from GitHubAPI
    //let repoList=await GithubAPI.getRepositories(owner);
    let repoList=getJson('/github-api/repolist.json');
    if(repoList.length>0){
        username.innerHTML+=`<h6><i>(${repoList.length} repositories found)</i></h6>`;
        for(let i in repoList){
            //Process data
            let date=new Date(repoList[i].created_at)
            let date_format=date.getFullYear() +'/'+('0' + (date.getMonth()+1)).slice(-2)+'/'+('0' + date.getDate()).slice(-2);
            let description=repoList[i].description ? `<p><strong>Description:</strong> ${repoList[i].description}</p>` : '';
            let license=repoList[i].license ? `<p><strong><i class="fas fa-balance-scale"></i></strong> ${repoList[i].license.name}</p>` : '';
            //let contributorsList=await GithubAPI.getContributors(owner, repoList[i].name);
            let contributorsList=getJson('/github-api/contributors.json');
            let contributors='';
            
            for(let c in contributorsList){
                contributors+=`<a><img style='width:64px;height:64px;' src='${contributorsList[c].avatar_url}' class='rounded-circle' alt='${contributorsList[c].login}' title='${contributorsList[c].login}'></img></a>`;
            }

            //Create tr
            let tr=document.createElement('tr');
            tr.innerHTML=(`
                <th scope='row' style='width: 40px;'>${Number(i)+1}</th>
                <td style='width: 50px;'>${date_format}</td>
                <td>
                    <p><strong>Repository:</strong> ${repoList[i].name}</p>
                    ${description}
                    <p><strong><i class="fas fa-link"></i></strong> <a href="${repoList[i].html_url}">${repoList[i].html_url}</a></p>
                    ${license}
                </td>
                <td>@TODO</td>
                <td>${contributors}</td>
            `);
            content.appendChild(tr);
        }
     
        //Add sorting of data table
        $(document).ready(function() {
            $("#tableAPI").DataTable({
                "bPaginate": false,
                "bFilter": true,
                "bInfo": false
             });
         });
         
         $('.odd').each(function() {
            $(this).find('*').addClass('bkg-secondary');
          });

        
    }else{
        //No repository found
        username.innerHTML+=`<h6 style='color:red;'><i>(${repoList.length} repository)</i></h6>`;
    }
    

        //order by date filtrer tab + nb filtered
    //https://developer.github.com/v3/guides/rendering-data-as-graphs/#visualizing-language-counts
    
}
function getJson(path){
    var request = new XMLHttpRequest();
    request.open('GET',path, false);
    request.send(null);
    return JSON.parse(request.responseText);
}