
/*
    Provides template to display result in page
*/
function TTVDisTemplate(ttvService, template) {

    this.ttvService = ttvService;
    this.template = template;
    this.template.TTVDisTemplate = this;
    this.ttv_image = this.template.getElementsByTagName('img')[0];
    this.ttv_image.addEventListener('mouseover', this.showVideoPreview.bind(this));
    this.ttv_image.addEventListener('mouseout', this.showImagePreview.bind(this));
    this.ttv_image.addEventListener('error', this.showImagePreview.bind(this));
    this.ttv_display_name = this.template.getElementsByTagName('h2')[0];
    this.ttv_game = this.template.getElementsByTagName('ttv-game')[0];
    this.ttv_viewers = this.template.getElementsByTagName('ttv-viewers')[0];
    this.ttv_desc = this.template.getElementsByTagName('ttv-desc')[0];
    this.stream = null;
    this.videoPreview = null;
    this.videoPreviewRequired = false;
    this.videoPreviewFetched = false;
}

/*
    Sets preview image
*/
TTVDisTemplate.prototype.showImagePreview = function() {
    
    console.debug("In showImagePreview");
    this.videoPreviewRequired = false;
    this.ttv_image.src = this.stream.preview.medium;
}

/*
    Sets animated preview image, If it is not available fetches from TwitchTV through API
*/
TTVDisTemplate.prototype.showVideoPreview = function() {
    
    console.debug("In showVideoPreview");
    this.videoPreviewRequired = true;
    if(!this.videoPreviewFetched && !this.videoPreview) {

        var tempURL =  this.stream.channel._links.videos + '?offset=0&limit=1';
        this.ttvService.fetch(tempURL, this.fetchVideoPreviewCallBack.bind(this), this.fetchVideoPreviewErrorCallBack.bind(this));
    } else 
        this.applyVideoPreview();
}

/*
    Success callback for fetching animated preview image
*/
TTVDisTemplate.prototype.fetchVideoPreviewCallBack = function(response) {
    
    console.debug("In fetchVideoPreviewCallBack");
    this.videoPreviewFetched = true;
    if(response.videos[0])
        this.videoPreview = response.videos[0];
    this.applyVideoPreview();
}

/*
    It applys animated preview image
*/
TTVDisTemplate.prototype.applyVideoPreview = function(response) {
    
    console.debug("In applyVideoPreview");
    if(this.videoPreview && this.videoPreviewRequired)
        this.ttv_image.src = this.videoPreview.animated_preview;
}

/*
    Error callback for fetching animated preview image
*/
TTVDisTemplate.prototype.fetchVideoPreviewErrorCallBack = function(response) {
    
    console.debug("In fetchVideoPreviewErrorCallBack");
}

/*
    It appends template to given element
*/
TTVDisTemplate.prototype.attach = function(ele) {
    
    ele.appendChild(this.template);
    this.ttv_desc.style.width = ((100 *(ele.clientWidth - 320 - 10 - 50)) / screen.availWidth) + '%';
    this.update(this.stream);
}

/*
    It sets stream object
*/
TTVDisTemplate.prototype.setStream = function(stream) {
    
    this.stream = stream;
    this.videoPreview = null;
    this.videoPreviewRequired = false;
    this.videoPreviewFetched = false;
}

/*
    It fills template with given stream object
*/
TTVDisTemplate.prototype.update = function(stream) {
    
    this.ttv_image.src = stream.preview.medium;
    this.ttv_display_name.innerHTML = stream.channel.display_name;
    this.ttv_game.innerHTML = stream.game;
    this.ttv_viewers.innerHTML = stream.viewers;
    this.ttv_desc.innerHTML = 'Stream description ' + stream.channel.status;
}

/*
    Fetches team information from TwitchTV through API
*/
TTVDisTemplate.prototype.fetchTeamInfo = function() {
    
    console.debug("In fetchTeamInfo");
    var tempURL =  this.stream.channel._links.teams + '?offset=0&limit=1';
    this.ttvService.fetch(tempURL, this.fetchTeamInfoSuccessCallBack.bind(this), this.fetchTeamInfoErrorCallBack.bind(this));
}

/*
    Success callback for fetching team information
*/
TTVDisTemplate.prototype.fetchTeamInfoSuccessCallBack = function(response) {
    
    console.debug("In fetchTeamInfoSuccessCallBack");
    if(response.teams.length > 0)
        this.ttv_desc.innerHTML = 'Stream description ' + response.teams[0].info;
}

/*
    Error callback for fetching team information
*/
TTVDisTemplate.prototype.fetchTeamInfoErrorCallBack = function() {
    
    console.debug("In fetchTeamInfoErrorCallBack");
}

/*
    Overrides default toString function
*/
TTVDisTemplate.prototype.toString = function() {

    return '"This is TTVDisTemplate"';
}

/*
    Provides pooling functionality for template
*/
function TTVDisTemplatePool(ttvService) {

    this.ttvService = ttvService;
    this.available = [];
}

/*
    Returns template from pool if available otherwise It creates new template and returns
*/
TTVDisTemplatePool.prototype.get = function() {

    if(this.available.length === 0)
        return new TTVDisTemplate(this.ttvService, this.getRawTemplate());
    else
        return this.available.pop();
}

/*
    It stores given template available for client
*/
TTVDisTemplatePool.prototype.return = function(tmpl) {

    if(tmpl instanceof TTVDisTemplate)
        this.available.push(tmpl);
}

/*
    Returns base template
*/
TTVDisTemplatePool.prototype.getRawTemplate = function() {

    if(!this.rawTemplate) {
        
        this.rawTemplate = document.createElement('div');
        this.rawTemplate.className = "ttv-result";
        var ttv_image = document.createElement('img');
        ttv_image.className = "ttv-shake";
        ttv_image.style.float = "left";    
        this.rawTemplate.appendChild(ttv_image);
        var details = document.createElement('div');
        this.rawTemplate.appendChild(details);
        var ttv_display_name = document.createElement('h2');
        ttv_display_name.id = "ttv_display_name";
        ttv_display_name.className = "ttv-result-details-dn";
        details.appendChild(ttv_display_name);
        details.appendChild(document.createElement('br'));
        var ttv_game = document.createElement('ttv-game');
        ttv_game.className = "ttv-result-details";
        details.appendChild(ttv_game);
        details.appendChild(document.createTextNode(' - '));
        var ttv_viewers = document.createElement('ttv-viewers');
        details.appendChild(ttv_viewers);
        details.appendChild(document.createTextNode(' viewers'));
        details.appendChild(document.createElement('br'));
        var ttv_desc = document.createElement('ttv-desc');
        ttv_desc.className = "ttv-result-details";
        details.appendChild(ttv_desc);
    }
    return this.rawTemplate.cloneNode(true);    
}

/*
    Overrides default toString function
*/
TTVDisTemplatePool.prototype.toString = function() {

    return '"This is TTVDisTemplatePool"';
}