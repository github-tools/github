/**
 * @author Vincent Berthet <vincent.berthet42@gmail.com>
 * @description v3 GitHub REST API https://developer.github.com/v3/
 */

 /**
  * A dedicated class to manage call to GitHub API
  */
class GithubAPI{
    constructor() {
    }

    /**
     * Use to send XHR function to a dedicated URL
     * @param {string} url URL to the endpoint of the GitHub API wanted
     */
    static _request(url){
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
    
            // Process
            xhr.onload = function (e) {
                if (xhr.readyState === 4) { //request finished
                    if (xhr.status === 200) { //HTTP status of the response
                        resolve(JSON.parse(this.response));
                    }
                    else {
                        reject(xhr.statusText);
                    }
                } else {
                  
                    reject(xhr.statusText);
                }
            };
            xhr.send(); 
        });
    }

    /**
     * Get all rate limit for a given user
     * https://developer.github.com/v3/rate_limit/#rate-limit
     * @param {string} username GitHub username
     */
    static async getRateLimit(username){
        return GithubAPI._request(`https://api.github.com/users/${username}/rate_limit`).then(function (data){
            return data;
        });
    }

    /**
     * Get all repository for a given user
     * https://developer.github.com/v3/repos/#list-repositories-for-a-user
     * @param {string} username GitHub username
     */
    static async getRepositories(username){
        return GithubAPI._request(`https://api.github.com/users/${username}/repos`).then(function (data){
            return data;
        });
    }

    /**
     * Get a repository for a given user
     * https://developer.github.com/v3/repos/#get-a-repository
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     */
    static async getRepository(owner,repository){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}`).then(function (data){
            return data;
        });
    }

    /**
     * Get the contents of the repository's license file, if one is detected.
     * https://developer.github.com/v3/licenses/#get-the-license-for-a-repository
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     */
    static async getLicense(owner,repository){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/license`).then(function (data){
            return data;
        })
    }

    /**
     * Get the tags for a given repository
     * https://developer.github.com/v3/git/tags/#get-a-tag
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     */
    static async getTags(owner,repository){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/tags`).then(function (data){
            return data;
        })
    }

    /**
     * Get a list of release for a given repository
     * https://developer.github.com/v3/repos/releases/#list-releases
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     */
    static async getReleases(owner,repository){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/releases`).then(function (data){
            return data;
        })
    }

    /**
     * Get a published release with the specified tag
     * https://developer.github.com/v3/repos/releases/#get-a-release-by-tag-name
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     * @param {string} tag Tag of the release
     */
    static async getRelease(owner,repository,tag){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/releases/tags/${tag}`).then(function (data){
            return data;
        })
    }

    /**
     * Geet the latest published full release for the repository
     * https://developer.github.com/v3/repos/releases/#get-the-latest-release
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     */
    static async getLatestRelease(owner,repository){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/releases/latest`).then(function (data){
            return data;
        })
    }

    /**
     * Gets the contents of a file or directory for a given repository
     * https://developer.github.com/v3/repos/contents/#get-repository-content
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     * @param {string} path File path or directory 
     */
    static async getContent(owner,repository,path){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/contents/${path}`).then(function (data){
            return data;
        })
    }

    /**
     * Gets the preferred README for a repository
     * https://developer.github.com/v3/repos/contents/#get-a-repository-readme
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     */
    static async getReadme(owner,repository){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/readme`).then(function (data){
            return data;
        })
    }

    /**
     * Lists languages for the specified repository. The value shown for each language is the number of bytes of code written in that language.
     * https://developer.github.com/v3/repos/#list-repository-languages
     * @param {strin} owner GitHub owner of the repository
     * @param {string} repository GitHub repository name
     * @param {boolean} percent Get percent instead of bytes 
     */
    static async getLanguages(owner,repository,percent=false){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/languages`).then(function (data){
            if(percent){
                let sum=0;
                for(let i in data){
                    sum+=data[i];
                }

                for(let i in data){
                    data[i]=Math.round((data[i]/sum)*10000)/100;
                }
            }
            return data;
        })
    }


    static async getContributors(owner,repository){
        return GithubAPI._request(`https://api.github.com/repos/${owner}/${repository}/contributors`).then(function (data){
            return data;
        })
    }
    
/*
    static async getMarkdownHTML(){
        //https://developer.github.com/v3/markdown/#render-a-markdown-document  
    }

    static async getPages(){

    }
*/
}