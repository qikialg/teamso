
var OldExhibitionPlace = null;

var OldFloorNum = 1;

var OldExhibitionHall = null;

var ShowDiv;

var HideDiv;

var ShowDivCSS;

var HideDivCSS;

var Level = 1;

var IsFirstTime = true;

var HandleRequest = false;

var ShowFaultCount = 6;

var CharPerLine = 18;

var ShowFaultLength = 34;

var FaultListObj = null;

var CurrentPage = 0;

var TotalPage;

var DivNum = 0;

var MoveFlag;

var MoreFlag;

var NoExhibitionPlace;

////  new fault paging
var serviceUrl = "http://113.12.226.243:9006/eventelement.aspx";
var pageFirstID = new Array();
var pageLastID = new Array();
var newFaultPageID = 0;
var touchEnd = false;
var pageVolume = 11;    // the upper of item that one page can hold
var oneLineHeight = 46;
var twoLineHeight = 66;

function getQueryString(name) {    
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");    
    var r = window.location.search.substr(1).match(reg);    
    if (r != null) return unescape(r[2]); return null;    
    }

    // show new fault page
    function ShowNewFaultPage(pagecontent, pageid, requestPar) {
        if (pagecontent.length <= 3) {
            return;
        }

        //clean old data
        $("#recordlistul").html("");
        var items = JSON.parse(pagecontent);
        var nitems = items.length;
        var oneLineMaxBytes = 18;

        //  set first item id
        pageFirstID[pageid] = items[0].status.objid;

        var totalHeight = 0;
        var itemid = 0;


        while (itemid <= (nitems - 1)) {
            var innerHTML = "<li>";

            var rawFaultContent = items[itemid].fault.fault_report;
            var byteCode = rawFaultContent.replace(/%u/g, "");
            var byteCodeLen = byteCode.length;

            if ((byteCodeLen * 0.5) > oneLineMaxBytes) {
                totalHeight += twoLineHeight;
            }
            else {
                totalHeight += oneLineHeight;
            }

            //  exceed the list
            if (totalHeight > 460) {
                break;
            }

            var unescapted = unescape(rawFaultContent);
            var truncated = unescapted.substr(0, 19);
            if (truncated.length < unescapted.length) {
                truncated += "...";
            }
            var recognized = htmldeescape(truncated);
            var detailPageUrl = "detail.html?oid=" + items[itemid].status.objid;

            innerHTML += "<a href=\"" + detailPageUrl + "\">" + recognized + "</a>";
            innerHTML += "<div class=\"list_r\"><a href=\"" + detailPageUrl + "\">" + "- " + MillionSecondToDate(items[itemid].status.date.$date, 0) + "</a></div>";
            innerHTML += "<div class=\"clear\"></div>";
            innerHTML += "</li>";
            $("#recordlistul").append(innerHTML);

            //  set last item id
            pageLastID[pageid] = items[itemid].status.objid;

            itemid++;
        }

        //  save item number in the page
        //nItemInPage[pageid] = itemid;

        //  change page id
        if (newFaultPageID > pageid) {  //  backward
            touchEnd = false;
        }
        newFaultPageID = pageid;


        //  set page information
        var par = { oc: "gpm", sbegin: requestPar.sbegin, send: requestPar.send, lastobjid: items[0].status.objid, status: requestPar.status };
        $.ajax({
            type: "POST",
            url: serviceUrl,
            data: par,
            success: function (data) {
                var pageInfo = JSON.parse(data);
                $("#page_tip").html("");
                var beginoffset = pageInfo.offset;
                var endoffset = pageInfo.offset + itemid - 1;
                $("#page_tip").append(beginoffset + "-" + endoffset + " of " + pageInfo.nitems);

                if (endoffset >= pageInfo.nitems) {
                    touchEnd = true;
                }
            }
        });
    }

    //  get perticular new faults page
    function GetNewFaultPage(pageid) {
        if ((pageid > newFaultPageID) && touchEnd) {   //  forward
            return;
        }
        else if ((pageid < newFaultPageID) && (pageid < 0)) {   //  backward
            return;
        }

        var lastid = "0";
        if (pageid > 0) {
            lastid = pageLastID[pageid - 1];
        }

        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        var begin = Date.parse(today);
        var end = Date.parse(tomorrow);
        var fetchPathPar = { oc: "ff", sbegin: begin, send: end, lastobjid: lastid, ntuples: pageVolume, status: 1 }; // fetch first 11 fault, 11 is enough for one page
        var pageTipPar = { sbegin: begin, send: end, ntuples: pageVolume, status: 1 };

        //  fetch fault data
        $.ajax({
            type: "POST",
            url: serviceUrl,
            data: fetchPathPar,
            success: function (data) {
                ShowNewFaultPage(data, pageid, pageTipPar);
            }
        });
    }

jQuery.fn.center = function () {
    this.css("position", "absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                                                $(window).scrollLeft()) + "px");
    return this;
}

jQuery.fn.centerObj = function (relObj) {
    this.css("position", "absolute");
    this.css("top", Math.max(0, ((relObj.height() - $(this).outerHeight()) / 2) + relObj.position().top + parseInt(relObj.css("marginTop"))) + "px");
    this.css("left", Math.max(0, ((relObj.width() - $(this).outerWidth()) / 2) + relObj.position().left + parseInt(relObj.css("marginLeft"))) + "px");
    return this;
}

function HomePageOnLoad() {

    InitDivAndCSS();

    //InitFaultList();

    InitExhibitionHall(1);

    ChangeRecordPosition();

    GetNewFaultPage(newFaultPageID);
}

function DetailPageLoad() {

    InitDetail();
}

function InitDetail() {
    var UrlValue = getQueryString("oid");

    var RequestUrl = "http://113.12.226.243:9006/eventelement.aspx?oc=faf&oid=" + UrlValue;

    $.post(RequestUrl, function (data) {
        InitDetailDiv(data);

    });

}

function InitDetailDiv(data) {
    var obj = jQuery.parseJSON(data);

    var fault_div = document.getElementById("fault_content");

    var tempcontenet = "";

    var fault_div_content = "<b>" + obj.floor_name + "</b> > <b>" + obj.hall_name + "</b> > <b>" + obj.subject_name + "</b><br/>";

    fault_div_content += "<h2>新故障</h2>";

    tempcontenet = unescape(obj.fault_report);

    tempcontenet = htmldeescape(tempcontenet);

    tempcontenet = RN2BR(tempcontenet);

    fault_div_content += tempcontenet;

    fault_div_content += "<br />";

    fault_div_content += "<div class=\"text_r\">" + MillionSecondToDate(obj.date.$date, 1) + " 某人</div>";

    fault_div.innerHTML = fault_div_content;
}

function showRightInfoBox(content) {
    var rightInfoBox = $("#right_info");
    rightInfoBox.hide();
    rightInfoBox.text(content);
    rightInfoBox.fadeIn('slow');
    rightInfoBox.fadeOut(4000);
}

//  warning/error information dialog
function showWrongInfoBox(content) {
    var rightInfoBox = $("#wrong_info");
    rightInfoBox.hide();
    rightInfoBox.text(content);
    rightInfoBox.fadeIn('slow');
    rightInfoBox.fadeOut(8000);
}

function ShortenContent(content) {

    var len = content.length;

    var shortcontentlen = 0;

    var i = 0;

    var result = "";

    var ch;

    MoreFlag = true;

    for (i = 0; i < len; i++) {

        ch = content.charCodeAt(i);

        if (ch >= 0 && ch < 128) {
            shortcontentlen++;
        }
        else {
            shortcontentlen += 2;
        }

        if (shortcontentlen > ShowFaultLength) {
            result += "...";

            break;
        }

        result += content[i];
    }

    result = htmldeescape(result);

    if (shortcontentlen <= CharPerLine) {
        MoreFlag = false;
    }

    return result;
}

function InitDivAndCSS() {
if(DivNum % 2 == 0) {
ShowDiv = document.getElementById("firstdiv");

HideDiv = document.getElementById("seconddiv");

ShowDivCSS = $(".div0");

HideDivCSS = $(".div1");
}
else {
ShowDiv = document.getElementById("seconddiv");

HideDiv = document.getElementById("firstdiv");

ShowDivCSS = $(".div1");

HideDivCSS = $(".div0");
}

DivNum++;
}

function htmldeescape(content) {
    var regExp = new RegExp("%3C|<", "g");

    content = content.replace(regExp, "&lt");

    var regExp1 = new RegExp("%3E|>", "g");

    content = content.replace(regExp1, "&gt");

    return content;
}

function RN2BR(content) {
    var regExp = new RegExp("\r", "g");

    content = content.replace(regExp, "");

    var regExp1 = new RegExp("\n","g");

    content = content.replace(regExp1,"<br />");

    return content;
}

function stringToBytes(str) {
    var ch, st=[], re = [];

    for (var i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);

        str = [];

        do {
            st.push(ch & 0xFF);

            ch = ch >> 8;
        } while (ch);

        re = re.concat(st.reverse());
    }

    return re;
}

function MillionSecondToDate(p,format) {
    var mydate = new Date();

    mydate.setFullYear(1970, 1, 1);

    mydate.setTime(0);

    mydate.setMilliseconds(p);

    var datestring;

    var timestring;

    var timevalue;

    switch (format) {
        case 0:
            datestring = (mydate.getMonth() + 1) + "月" + mydate.getDate() + "日";
            break;
        case 1:
            datestring = mydate.getFullYear() + "年" + (mydate.getMonth() + 1) + "月" + mydate.getDate() + "日  ";

            timevalue = mydate.getHours();

            if (timevalue < 10) {
                timestring = "0" + timevalue;
            }
            else {
                timestring = "" + timevalue;
            }

            timevalue = mydate.getMinutes();

            if (timevalue < 10) {
                timestring += ":0" + timevalue;
            }
            else {
                timestring += ":" + timevalue;
            }

            datestring += timestring;

            break;
    }

    return datestring;
}

function MoveFinish() {


    HandleRequest = false;

    MoveFlag = true;

    ShowDiv.style.zIndex = 1;
    ShowDiv.style.display = "block";
    HideDiv.style.display = "none";
    HideDiv.style.marginLeft = 0;
    HideDiv.style.marginTop = 0;
    HideDiv.style.zIndex = 0;
}

function Move(direction) {

    var moveObj = HideDivCSS;

    MoveFlag = false;

    switch (direction) {
        case 0:
            moveObj.animate({ "margin-top": "+=330" }, "slow", MoveFinish);
            break;
        case 1:
            moveObj.animate({ "margin-left": "-=500" }, "slow", MoveFinish);
            break;
        case 2:
            moveObj.animate({ "margin-left": "+=500" }, "slow", MoveFinish);
            break;
    }



}

function ClearExhibitionHallClickStatus() {
    if (OldExhibitionHall != null) {

        OldExhibitionHall.className = "listyle";

        OldExhibitionHall.childNodes[0].childNodes[0].className = "navrightpic";

        OldExhibitionHall.childNodes[0].childNodes[0].childNodes[0].className = "textcolor";
        
        OldExhibitionHall = null;
    }
}

function SetExhibitionHallClickStatus() {
    if (OldExhibitionHall != null) {

        OldExhibitionHall.className = "liselectstyle";

        OldExhibitionHall.childNodes[0].childNodes[0].className = "navrightselectpic";

        OldExhibitionHall.childNodes[0].childNodes[0].childNodes[0].className = "textcolorclick";
    }
}

function ClearExhibitionPlaceClickStatus() {
    if (OldExhibitionPlace != null) {

        OldExhibitionPlace.className = "listyle";

        OldExhibitionPlace.childNodes[0].childNodes[0].className = "navrightpic";

        OldExhibitionPlace.childNodes[0].childNodes[0].childNodes[0].className = "textcolor";

        OldExhibitionPlace = null;
    }
}

function SetExhibitionPlaceClickStatus() {
    if (OldExhibitionPlace != null) {

        OldExhibitionPlace.className = "liselectstyle";

        OldExhibitionPlace.childNodes[0].childNodes[0].className = "navrightselectpic";

        OldExhibitionPlace.childNodes[0].childNodes[0].childNodes[0].className = "textcolorclick";

    }
}


function ExhibitionHallClick(ExhibitionHallID) {

    if ((HandleRequest == true) || (MoveFlag == false)) {
        return;
    }

    InitExhibitionPlace(ExhibitionHallID);

//    var obj = document.getElementById(ExhibitionHallID);

//    Level = 3;

//    InitDivAndCSS();

//    if ((OldExhibitionHall == null) || (obj.className != "liselectstyle")) {
//        ClearExhibitionPlaceClickStatus();

//        OldExhibitionPlace = null;

//        InitExhibitionPlace(ExhibitionHallID);
//    }

//    else
//    {
//    ClearExhibitionHallClickStatus();

//    OldExhibitionHall = obj;

//    SetExhibitionHallClickStatus();

//    ChangeRecordPosition();

//    document.getElementById("navbutton").innerHTML = "<a href=\"#\"><img src=\"images/btn_left.png\" border=\"0\" onclick=\"ButtonLeftClick()\"/></a>";
}

function ButtonLeftClick() {

    if (HandleRequest == true) {
        return;
    }

    HandleRequest = true;
    InitDivAndCSS();
    document.getElementById("navbutton").innerHTML = "<a href=\"#\"><img src=\"images/btn_right.png\" border=\"0\" onclick=\"ButtonRightClick()\"/></a>"
    Level = 2;
    ChangeRecordPosition();
    Move(1);
}

function ButtonRightClick() {

    if (HandleRequest == true) {
        return;
    }
    if (OldExhibitionPlace != null) {
        HandleRequest = true;
        InitDivAndCSS();
        document.getElementById("navbutton").innerHTML = "<a href=\"#\"><img src=\"images/btn_left.png\" border=\"0\" onclick=\"ButtonLeftClick()\"/></a>";
        Level = 3;
        ChangeRecordPosition();
        Move(2);
    }
}

function ExhibitionPlaceClick(ExhibitionPlaceID) {

    if (HandleRequest == true) {
        return;
    }

    ClearExhibitionPlaceClickStatus();

    //alert(ExhibitionPlaceID);

    OldExhibitionPlace = document.getElementById(ExhibitionPlaceID);

    SetExhibitionPlaceClickStatus();

    ChangeRecordPosition();

}


function InitExhibitionDiv(data) {

    var obj = jQuery.parseJSON(data);

    var content = "";

    content += "<div class=\"select_l\">";

    content += "<ul>";

    if (obj != null) {
        var len = obj.Halls.length;

        for (var i = 0; i < len; i++) {
            content += "<li class=\"listyle\" id=\"" + obj.Halls[i].gid + "\" onclick=\"ExhibitionHallClick('" + obj.Halls[i].gid + "')\"><a href=\"#\"><div class=\"navrightpic\"><div class=\"textcolor\">" + obj.Halls[i].name + "</div></div></a></li>";
        }
    }

    content += "</ul>";

    content += "<div class=\"clear\"></div>";

    content += "</div>";

    document.getElementById("navbutton").innerHTML = "<a href=\"#\"><img src=\"images/btn_right.png\" border=\"0\" onclick=\"ButtonRightClick()\"/></a>";

    content += "<div class=\"clear\"></div>";

    ShowDiv.innerHTML = content;

    Move(0);
}

function InitExhibitionHall(ExhibitionHallContent) {


    HandleRequest = true;

    url = "http://113.12.226.243:9006/eventelement.aspx?oc=hi&fc=" + ExhibitionHallContent + "楼";

    $.post(url, function (data) {

        InitExhibitionDiv(data);
    });
}

function InitExhibitionPlaceDiv(data,ExhibitionHallID) {

    var hallobj = document.getElementById(ExhibitionHallID);

    InitDivAndCSS();

    if ((OldExhibitionHall == null) || (hallobj.className != "liselectstyle")) {

        var obj = jQuery.parseJSON(data);

        var content = "";

        content += "<div class=\"select_l\">";

        content += "<ul>";

        if (obj != null) {
            var len = obj.subjectsID.length;

            for (var i = 0; i < len; i++) {
                content += "<li class=\"listyle\" id=\"" + obj.HallID + "@" + obj.subjectsID[i].gid + "\" onclick=\"ExhibitionPlaceClick('" + obj.HallID + "@" + obj.subjectsID[i].gid + "')\"><a href=\"#\"><div class=\"navrightpic\"><div class=\"textcolor\">" + obj.subjectsID[i].name + "</div></div></a></li>";
            }
        }

        content += "</ul>";

        content += "<div class=\"clear\"></div>";

        content += "</div>";

        content += "<div class=\"clear\"></div>";


        ClearExhibitionPlaceClickStatus();

        OldExhibitionPlace = null;

        ShowDiv.innerHTML = content;
    }
    Level = 3;

    ClearExhibitionHallClickStatus();

    OldExhibitionHall = hallobj;

    SetExhibitionHallClickStatus();

    ChangeRecordPosition();

    document.getElementById("navbutton").innerHTML = "<a href=\"#\"><img src=\"images/btn_left.png\" border=\"0\" onclick=\"ButtonLeftClick()\"/></a>";

    Move(2);

    HandleRequest = false;
}

function InitExhibitionPlace(ExhibitionHallID) {

    url = "http://113.12.226.243:9006/eventelement.aspx?oc=si&hc=" + ExhibitionHallID;

    HandleRequest = true;

    $.post(url, function (data) {

        if (data != "") {

            NoExhibitionPlace = false;

            InitExhibitionPlaceDiv(data, ExhibitionHallID);
        }
        else {
            var hallobj = document.getElementById(ExhibitionHallID);

            ClearExhibitionPlaceClickStatus();

            OldExhibitionPlace = null;

            Level = 2;

            ClearExhibitionHallClickStatus();

            OldExhibitionHall = hallobj;

            SetExhibitionHallClickStatus();

            ChangeRecordPosition();

            HandleRequest = false;

            NoExhibitionPlace = true;
        }

        CheckSaveButtonEnable();
    });

}

function FloorClick(FloorNumber) {

    if ((HandleRequest == true) || (MoveFlag == false)) {
        return;
    }

    if ((FloorNumber == OldFloorNum) && (Level <= 2)) {
        return;
    }

    InitDivAndCSS();

    Level = 1;

    OldFloorNum = FloorNumber;

    OldExhibitionHall = null;

    ClearExhibitionPlaceClickStatus();

    var floorObj = document.getElementById("floorimg");

    var imgpath = "images/floor" + FloorNumber + ".jpg";

    floorObj.src = imgpath;

    switch (FloorNumber) {
        case -1:
            InitExhibitionHall(-1);
            break;
        case 1:
            InitExhibitionHall(1);
            break;
        case 2:
            InitExhibitionHall(2);
            break;
        case 3:
            InitExhibitionHall(3);
            break;
    }

    ChangeRecordPosition();
}

function SaveClick() {
    AddRecordList(document.getElementById("recordcontent").value);
}

function AddRecordList(recordContent) {
    if (HandleRequest == true) {
        return;
    }

    if (recordContent == "") {
        showWrongInfoBox("故障描述为空，请对故障进行说明");

        return;
    }
    else {
        if ((OldExhibitionHall == null) || ((NoExhibitionPlace == false) && (OldExhibitionPlace == null))) {
            showWrongInfoBox("请选择 展厅、展项并对故障进行描述后再进行保存");

            return;
        }
    }

    var ulobj = document.getElementById("recordlistul");

    var oldcontent = "";

    var shortcontent;

    var mydate = new Date();

    var escaptedContent = escape(recordContent);

    var RequestUrl = "http://113.12.226.243:9006/eventelement.aspx";

    var id;

    var lt_value;

    if (NoExhibitionPlace == true) {
        lt_value = 1024;

        id = OldExhibitionHall.id;
    }
    else {
        lt_value = 512;

        id = OldExhibitionPlace.id.split("@")[1];
    }

    var parameter = { oc: "gf", lt: lt_value, gid: id, content: escaptedContent };

    HandleRequest = true;

    $.ajax(
    {
        type: "POST",

        url: RequestUrl,

        data: parameter,

        success: function (data) {

            HandleRequest = false;

            var result = stringToBytes(data);

            if (result[0] == 1) {

                showRightInfoBox("故障已提交，系统将会通知相关人员进行处理");

                document.getElementById("recordcontent").value = "";

                OldFloorNum = 0;

                FloorClick(1);

                GetNewFaultPage(0);
            }
            else {
            }
        }
    });

}

function RecordPositionClick(LevelClick) {

    if (HandleRequest == true) {
        return;
    }
    switch (LevelClick) {
        case 1:
            FloorClick(OldFloorNum);
            break;
        case 2:
            ClearExhibitionPlaceClickStatus();
            ChangeRecordPosition();
            break;
    }
}

function ChangeRecordPosition() {

    var positionobj = document.getElementById("recordposition");

    var positioncontent = "<p>故障位置： ";

    if (OldFloorNum != null) {
        positioncontent += "<b><a href=\"#\" onclick=\"RecordPositionClick(1)\">";

        positioncontent += OldFloorNum;

        positioncontent += "楼</a></b>";

        if ((OldExhibitionHall != null) && (Level >= 2)) {
            positioncontent += " > <b><a href=\"#\" onclick=\"RecordPositionClick(2)\">";

            positioncontent += OldExhibitionHall.innerText;

            positioncontent += "</a></b>";

            if ((OldExhibitionPlace != null) && (Level >= 3)) {
                positioncontent += " > <b>";

                positioncontent += OldExhibitionPlace.innerText;

                positioncontent += "</b>";
            }
        }
    }

    positioncontent += "</p>";

    positionobj.innerHTML = positioncontent;

    CheckSaveButtonEnable();
}

function InitFaultListDiv(begin,end)
{
    var content;

    document.getElementById("recordlistul").innerHTML = "";

    var len = FaultListObj.length - 1;

    for(var i = begin; i < end; i++){
        content = "<li>";

        //  fault description
        content += "<a href=\"detail.html?" + FaultListObj[len - i].fault._id.$oid + "\">";
        var faultcontent = unescape(FaultListObj[ len - i ].fault.fault_report);
        content += ShortenContent(faultcontent);
        content += "</a>";

        //  presentation date
        var datePreference = "- ";
        content += "<div class=\"list_r\"><a href=\"#\">" + datePreference + MillionSecondToDate(FaultListObj[ len - i ].status.date.$date,0) + "</a></div>";

        if (MoreFlag == false) {
            content += "<BR/>&nbsp";
        }

        content += "<div class=\"clear\"></div>";

        //  close li
        content += "</li>";

        $("#recordlistul").append(content);
    }
}

function InitFaultList() {
    var mydate = new Date();

    var yesterday = mydate.getFullYear() + "/" + (mydate.getMonth() + 1) + "/" + (mydate.getDate() - 1);

    var nextday = mydate.getFullYear() + "/" + (mydate.getMonth() + 1) + "/" + (mydate.getDate() + 1);

    var begin = Date.parse(yesterday);

    var end = Date.parse(nextday);

    var RequestUrl = "http://113.12.226.243:9006/eventelement.aspx?oc=ff&sbegin=" + begin +"&send=" + end + "&status=1";

    HandleRequest = true;

    $.post(RequestUrl, function (data) {

        FaultListObj = JSON.parse(data);

        var length = FaultListObj.length;

        TotalPage = parseInt(length / ShowFaultCount) + ((length % ShowFaultCount == 0) ? 0 : 1);

        FirstPageClick();

        HandleRequest = false;
    });
}

function CheckSaveButtonEnable() {
    var content = document.getElementById("recordcontent").value;

    var SaveButtonObj = document.getElementById("SaveButton");

    if ((content != "") && (OldExhibitionHall != null) && ((NoExhibitionPlace == true) || (OldExhibitionPlace != null))) {

        SaveButtonObj.innerHTML = "<a href=\"#\"><img src=\"images/btn.jpg\" border=\"0\" onclick=\"SaveClick()\"/></a>";

    }
    else {

        SaveButtonObj.innerHTML = "<a href=\"#\"><img src=\"images/btn_disable.jpg\" border=\"0\" /></a>";
    }
}