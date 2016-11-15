
/*
    It provides functionality to interact with TwitchTV API service
*/
function TTVService() {

    this.baseURL = "https://api.twitch.tv/kraken/search/streams?";
    this.auth = 'client_id=swivig4d1wwur5r5qjnspj2hwn26hpm&oauth_token=jhfwxdw8ukhn5st9sz17q391ifd1b0';
}

/*
    Returns base URL
*/
TTVService.prototype.getBaseURL = function() {

    return this.baseURL;
}

/*
    Fetches data from TwitchTV using given url
*/
TTVService.prototype.fetch = function(url, success, error) {

    var script = document.createElement('script');
    script.type = 'text/javascript';
    var tempVar = Math.floor(Math.random() * 1000);
    tempVar = "TTVServiceFetchCallBack" + tempVar;
    window[tempVar] = this.fetchCallBack.bind(this, success, script);
    if(!/\?$/.test(url))
        url += '&';
    script.src = url + this.auth + '&callback=' + tempVar;
    script.addEventListener('error', this.fetchErrorCallBack.bind(this, error, script));
    document.getElementsByTagName('head')[0].appendChild(script);
}

/*
    It is success callback
*/
TTVService.prototype.fetchCallBack = function(success, script, response) {

    success(response);
    this.removeScript(script);
}

/*
    it is error callback
*/
TTVService.prototype.fetchErrorCallBack = function(error, script, response) {

    error(response);
    this.removeScript(script);
}

/*
    Removes script tag from document
*/
TTVService.prototype.removeScript = function(script) {

    if(script) {
        document.getElementsByTagName('head')[0].removeChild(script);
        delete script;
    }
}

/*
    Overrides default toString function
*/
TTVService.prototype.toString = function() {

    return '"This is TTVService"';
}