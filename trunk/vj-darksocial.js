/*~*~*~*~*~*~*~*~*~ ISSUES
xxxx direct overrides; campaign poisoning; cannot kill and let trackPV rebuild
events not firing - tested, they are not firing in the body of the case, for some reason
generation calc'd but not passed - trying to pass in event
repackCMP not handling various combos properly - in progress, possibly solved

*~*~*~*~*~*~*~*~*/

var _gaq = _gaq||[];

function _darksocial(state){
    //setup
    var visitr;
    var oHash;
    
    //regardless of state, we need visitor id, so let's get it now
    visitr = __getId();
    
    //we need to ensure that the utmz exists
    if(__readCookie('__utmz')==false){
	_gaq.push(['_initData']);
    }
    
    //switch based on state
    switch(state){
	case 'init':
	    //not implemented
	    
	    break;
	case 'exec':
	    
	    //we don't want to override anything but direct; rehash in all cases
	    if(__isDirect()){
		
		//if share is true, test hash, then log (repackCmp) and rehash; otherwise just rehash (doOrigin).
		if(__hasShare()){
		    oHash = __unpackHash();
		    if(oHash[0]!=visitr && oHash[1]!=visitr){
			
			//set category as the originator, action as the sharer, label as the generation  -   _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
			_gaq.push(['_trackEvent', 'darksocial', 'nth gen', eval(oHash[2])+1, 0, 1]);
			
			//set the source to origin [0] and the campaign to the referrer/sharer [1]
			__repackCmp(oHash[0],oHash[1],'darksocial');
			
			//reset the hash with the origin intact, visitor id, and increment generation
			__repackHash(oHash[0],visitr,eval(oHash[2])+1);
			
		    }else{
			//looked like a share, but includes the sharer;
			//does this indicate some sort of local retrieval (e.g.:history or bookmark?)
			//history will increment the generation each time, bookmark will show the same generation
		    }
		}else{
		    __doOrigin(visitr);
		    
		    //set the source as visitr, but leave the rest of the cookie alone
		    __repackCmp(visitr);
		}
	    }else{
		 __doOrigin(visitr);		
	    }
	    break;
	default:
	    //not implemented, do nothing
    }
    
    //set visitor id in slot 4 (as in who this is "for"), set cv as visitor level
    _gaq.push(['_setCustomVar', 4, 'v', visitr, 1]);
    
    
}
function __isDirect(){
    // need to prevent darksocial poisoning  - test document.referrer.length  then kill utmz, allow trackPV to rebuild
    var cky = '__utmz';
    var cVal = __readCookie(cky, 1);
    if(document.referrer.length==0){  //not enough that they are 'direct' this time, we want to protect previous campaigns (if any)
	if(( cVal.indexOf('darksocial')!=-1 || cVal.indexOf('md=(none)')!=-1 )){
	    return true;
	}else{
	    return false;
	}
    }else{
	//kill utmz if has darksocial, otherwise let it ride
	/*if((cVal.indexOf('darksocial'))!=-1){
	    console.log(cVal);
	    //__deleteCookie(cky);
	    __resetCmp();
	    console.log('resetto');
	    cVal = __readCookie(cky, 1);
	    console.log(cVal);
	    _gaq.push(['_initData']);
	    cVal = __readCookie(cky, 1);
	    console.log(cVal);
	}*/
	return false;
    }
}
function __hasShare(){
    //format: originator.sharer.gen
    if(location.hash && location.hash.match(/\#[0-9]+\.[0-9]+\.[0-9]+/)){
	return true;
    }else{
	return false;
    }
}
function __doOrigin(visitr){
    //visitor is the originator, the sharer, and the first generation
    __repackHash(visitr,visitr,1);
    
    //set the originating visitor event
    //_gaq.push(['_trackEvent', visitr, visitr, 1, 0, 1]);
}
function __unpackHash(){
    var oHash = location.hash;
    oHash = oHash.substring(1,oHash.length);
    oHash = oHash.split('.');
    return oHash;
}
function __repackHash(a,b,c){
    window.location.hash = a +'.'+ b +'.'+ c;
}
function __getId(){
    var cky = '__utma';
    var ret = __readCookie(cky,1);
    if (__readCookie(cky) === 0){
	return false;
    }else{
	    ret = ret.split('.');
	    return ret[1];		
    }
}
function __repackCmp(src,cmp,med){ //3 args required, max 5, vals other than FALSE will override
    var cky = '__utmz';
    var str;
    var pre;
    var parms = ['utmcsr','utmccn','utmcmd','utmctr','utmcct']; //0=src 1=cmp 2=medium 3=keyword? 4=content
    var ret = __readCookie(cky,1);
    if (__readCookie(cky) === 0){
	return false;
    }else{
	ret = ret.split('.');
	//1.1352580680.1.1.utmcsr=%source%|utmccn=%campaignname%|utmcmd=%medium%|utmctr=%keyword%|utmcct=%content%
	pre = ret[0] +'.'+ ret[1] +'.'+ ret[2]  +'.'+ ret[3] +'.';
	//campaign is ret[4]
	ret = ret[4].split('|');
	
	if(ret.length==4 && ret[3].indexOf('utmcct')){
	    parms[3] = 'utmcct'; //keyword is not present
	}
	for(i=0;i<arguments.length;i++){
	    ret[i] = (arguments[i]==false) ? ret[i] : parms[i]+'='+arguments[i];
	}
	str=ret[0]
	for(i=1;i<ret.length;i++){
	    str += '|'+ret[i];
	}
	
	__createCookie(cky, pre+str, 184);
	return true;
    }    
}
function __resetCmp(){
    __repackCmp('(direct)','(direct)','(none)');
}
//bakery functions credited to http://www.quirksmode.org/js/cookies.html, with minor mods
function __createCookie(name,value,days) {
    if (days) {
	var date = new Date();
	date.setTime(date.getTime()+(days*24*60*60*1000));
	var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+";domain=."+location.hostname+";path=/";
}
function __readCookie(name) {  //returns boolean set/not; add second arg to return value as a str
    var nameEQ = name + "=";
    var jar = document.cookie.split(';');
    var isSet = false;
    var strOut = '';
    for(var i=0;i < jar.length;i++) {
	var c = jar[i];
	while (c.charAt(0)==' ') c = c.substring(1,c.length);
	if (c.indexOf(nameEQ) == 0){
	    strOut = c.substring(nameEQ.length,c.length);
	    isSet = true;
	}
    }
    return (arguments.length == 2) ? strOut : isSet;
}
function __deleteCookie(name) {
    __createCookie(name,"",-1);
}
















