
/*
    It provides basic functionality of TwitchTV API call, display current page result based on pagination logic
*/
function TTVPage(ttvService, ttvDisTemplatePool) {

    this.ttvService = ttvService;
    this.ttvDisTemplatePool = ttvDisTemplatePool;
    this.displayResults = document.getElementById("displayResults");
    this.totalResults = document.getElementById("totalResults");
    this.currentPage = document.getElementById("currentPage");
    this.totalPages = document.getElementById("totalPages");
    this.queryData = document.getElementById("queryData");
    this.resultPerPage = 10;
    this.queryLimit = 50;
    this.responseData;
    this.currentStartIdx;
    this._total;
    this.searchQueryData;
    this.ttvTwitchAPIRequestErrorRequired;
    this.loader = document.createElement('div');
    this.loader.className = 'loader';
    this.informationPanel = document.createElement('div');
    this.informationPanel.className = 'information';
    document.getElementsByTagName('body')[0].appendChild(this.informationPanel);
    this.informationPanelPopulated = false;
    this.informationPanelInProgress = null;
}

/*
    Parses JSON response from TwitchTV API
*/
TTVPage.prototype.parseResults = function(data) {

    console.debug("In parseResults");
    this.responseData = data;
    if(data.streams.length < this.queryLimit)
        this._total = data.streams.length;
    else
        this._total = data._total;
    if(this._total === 0) {
        
        this.displayResults.innerHTML = "No game was found";
        this.currentPage.innerHTML = "0";
        this.totalPages.innerHTML = "0";
        this.totalResults.innerHTML = "0";
    } else {

        this.setPaginationDetails();
        this.displayResultByPage(0);
        this.showInformationPanel();
    }
}

/*
    Parses next set of JSON response from TwitchTV API
*/
TTVPage.prototype.parseSubResults = function(data) {

    console.debug('In parseSubResults');
    this.responseData._links = data._links;
    if(data.streams.length < this.queryLimit)
        this._total = this.responseData.streams.length + data.streams.length;
    this.setPaginationDetails();
    for(var i = 0; i < data.streams.length; i++) {

        this.responseData.streams.push(data.streams[i]);
    }
    this.nextPage();
}

/*
    Displays pagination details in HTML page like total streams, current page number and total page number
*/
TTVPage.prototype.setPaginationDetails = function() {

    console.debug('In setPaginationDetails');
    this.totalResults.innerHTML = this._total;
    var tempTotalPages = Math.floor(this._total / this.resultPerPage);
    if(this._total !== 0 && this._total % this.resultPerPage !== 0)
      tempTotalPages++;
    this.totalPages.innerHTML = tempTotalPages;
}

/*
    Displays information panel
*/
TTVPage.prototype.showInformationPanel = function(force, message) {

    if(!this.informationPanelPopulated || force) {

        this.informationPanelPopulated = true;
        if(message)
            this.informationPanel.innerHTML = message;
        else
            this.informationPanel.innerHTML = "Hover on image for sample animated preview";
        this.informationPanel.style.display = "block";
        if(this.informationPanelInProgress)
            clearTimeout(this.informationPanelInProgress);
        this.informationPanelInProgress = setTimeout(this.hideInformationPanel.bind(this), 4000);
    }
}

/*
    Hides information panel
*/
TTVPage.prototype.hideInformationPanel = function() {

    this.informationPanel.style.opacity = 0;
    setTimeout(this.removeInformationPanel.bind(this), 2000);
}

/*
    Removes information panel
*/
TTVPage.prototype.removeInformationPanel = function() {

    this.informationPanel.style.display = "none";
    this.informationPanel.style.opacity = 0.9;
    this.informationPanelInProgress = null;
}

/*
    Displays the result in HTML page based on current page logic
*/
TTVPage.prototype.displayResultByPage = function(startIdx) {
    
    console.debug('In displayResultByPage');
    this.clearCurrentDisplayResultByPage();
    this.currentStartIdx = startIdx;
    this.currentPage.innerHTML = (startIdx / this.resultPerPage) + 1;
    var endIdx;
    if(this.responseData.streams.length < startIdx + this.resultPerPage)
        endIdx = this.responseData.streams.length;
    else
        endIdx = startIdx +this.resultPerPage;
    var ttvTemp;
	 for(var i = startIdx; i < endIdx; i++) {

       ttvTemp = this.ttvDisTemplatePool.get();
       ttvTemp.setStream(this.responseData.streams[i]);
       ttvTemp.attach(this.displayResults);
	 }
}

/*
    Removes all displayed result from HTML page
*/
TTVPage.prototype.clearCurrentDisplayResultByPage = function() {

    console.debug('In clearCurrentDisplayResultByPage');
    var childs = this.displayResults.childNodes;
    for(var i = childs.length - 1; i >= 0; i--) {

        var removed = this.displayResults.removeChild(childs[0]);
        if(removed.TTVDisTemplate)
            this.ttvDisTemplatePool.return(removed.TTVDisTemplate);
    }
}

/*
    It navigates to previous page based on pagination logic
*/
TTVPage.prototype.previousPage = function() {

    console.debug("In previousPage");
    if((this.currentStartIdx - this.resultPerPage) >= 0)
        this.displayResultByPage(this.currentStartIdx - this.resultPerPage);
}

/*
    It navigates to next page based on pagination logic
*/
TTVPage.prototype.nextPage = function() {
    
    console.debug("In nextPage");
    if(this._total > (this.currentStartIdx + this.resultPerPage) && this.responseData.streams.length <= (this.currentStartIdx + this.resultPerPage)) {

        console.debug("In nextPage - fetching next set");
        this.searchQueryFromOffset(this.searchQueryData, this.currentStartIdx + this.resultPerPage, this.parseSubResults, this.ttvTwitchAPIRequestError, this.responseData._links.next);
        return;
    }

    if(this._total > (this.currentStartIdx + this.resultPerPage))
        this.displayResultByPage(this.currentStartIdx + this.resultPerPage);
}

/*
    Makes TwitchTV API request based on value in input box
*/
TTVPage.prototype.searchQuery = function() {
    
    console.debug('In searchQuery');
    if(this.queryData.value === '') {

        this.showInformationPanel(true, "<font color='red'>Enter valid query to search</font>");
        return;
    }
    this.clearCurrentDisplayResultByPage();
    this.searchQueryData = this.queryData.value;
    this.searchQueryFromOffset(this.queryData.value, 0, this.parseResults, this.ttvTwitchAPIRequestError, null);
}

/*
    Makes TwitchTV API request based on value passed in arguments
*/
TTVPage.prototype.searchQueryFromOffset = function(query, offset, successCallback, errorCallback, url) {

    console.debug("In searchQueryFromOffset query - " + query + ', offset - ' + offset);
    var tempURL;
    if(url)
        tempURL = url;
    else
        tempURL = this.ttvService.getBaseURL() + 'q=' + query + '&offset=' + offset + '&limit=' + this.queryLimit;
    if(offset === 0) {
        this.ttvTwitchAPIRequestErrorRequired = true;
        this.displayResults.appendChild(this.loader);
    }
    else
        this.ttvTwitchAPIRequestErrorRequired = false;
    this.ttvService.fetch(tempURL, successCallback.bind(this), errorCallback.bind(this));
}

/*
    It is invoked to verify TwitchTV API request is success or not
*/
TTVPage.prototype.ttvTwitchAPIRequestError = function() { 

    console.debug('In ttvTwitchAPIRequestError ');
    if(this.ttvTwitchAPIRequestErrorRequired) {

        this.displayResults.innerHTML = "No game was found";
        this._total = 0;
        this.setPaginationDetails();        
        this.currentPage.innerHTML = "0";
    }
}

/*
    Overrides default toString function
*/
TTVPage.prototype.toString = function() {

    return '"This is TTVPage"';
}