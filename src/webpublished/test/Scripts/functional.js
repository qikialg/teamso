
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

var ShowFaultCount = 8;

var CharPerLine = 20;

var FaultListObj = null;

var CurrentPage = 0;

var TotalPage;

var DivNum = 0;

var MoveFlag;

function ShortenContent(content) {

    var len = content.length;

    var shortcontentlen = 0;

    var i = 0;

    var result = "",tempresult = "";

    var ch;

    var MoreFlag = len > CharPerLine * 2;

    for (i = 0; i < len; i++) {

        ch = content.charCodeAt(i);

        if (ch >= 0 && ch < 128) {
            shortcontentlen++;
        }
        else {
            shortcontentlen += 2;
        }

        if (shortcontentlen > CharPerLine) {
            break;
        }

        tempresult += content[i];
    }

    result += htmldeescape(tempresult);

    result += "<BR />";

    if (len <= CharPerLine) {
        result += "&nbsp";
    }

    shortcontentlen = 0;

    tempresult = "";

    for (; i < len; i++) {
        ch = content.charCodeAt(i);

        if (ch >= 0 && ch < 128) {
            shortcontentlen++;
        }
        else {
            shortcontentlen += 2;
        }

        if (MoreFlag) {
            if (shortcontentlen > (CharPerLine - 3)) {
                tempresult += "...";
                break;
            }
        }
        else {
            if (shortcontentlen > CharPerLine) {
                break;
            }
        }

        tempresult += content[i];
    }

    result += htmldeescape(tempresult);

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

function MillionSecondToDate(p) {
    var mydate = new Date();

    mydate.setFullYear(1970, 1, 1);

    mydate.setTime(0);

    mydate.setMilliseconds(p);

    var datestring = (mydate.getMonth() + 1) + "月" + mydate.getDate() + "日";

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

    //alert(ExhibitionHallID);

    var obj = document.getElementById(ExhibitionHallID);

    Level = 3;

    InitDivAndCSS();

    if ((OldExhibitionHall == null) || (obj.className != "liselectstyle")) {
        ClearExhibitionPlaceClickStatus();

        OldExhibitionPlace = null;

        InitExhibitionPlace(ExhibitionHallID);
    }

    ClearExhibitionHallClickStatus();

    OldExhibitionHall = obj;

    SetExhibitionHallClickStatus();

    ChangeRecordPosition();

    document.getElementById("navbutton").innerHTML = "<a href=\"#\"><img src=\"images/btn_left.png\" border=\"0\" onclick=\"ButtonLeftClick()\"/></a>";

    Move(2);

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

function InitExhibitionPlaceDiv(data) {
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

    ShowDiv.innerHTML = content;

    HandleRequest = false;
}

function InitExhibitionPlace(ExhibitionHallID) {

    url = "http://113.12.226.243:9006/eventelement.aspx?oc=si&hc=" + ExhibitionHallID;

    HandleRequest = true;

    $.post(url, function (data) {

        InitExhibitionPlaceDiv(data);
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
        alert("故障描述不能为空");

        return;
    }
    else {
        if ((OldExhibitionHall == null) || (OldExhibitionPlace == null)) {
            alert("请先选择完必要的信息");

            return;
        }
    }

    var ulobj = document.getElementById("recordlistul");

    var oldcontent = "";

    var shortcontent;

    var mydate = new Date();

    var escaptedContent = escape(recordContent);

    var RequestUrl = "http://113.12.226.243:9006/eventelement.aspx";

    var id = OldExhibitionPlace.id.split("@")[1];

    var parameter = { oc: "gf", lt: 512, gid: id, content: escaptedContent };

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

                alert("保存成功");

                document.getElementById("recordcontent").value = "";

                OldFloorNum = 0;

                FloorClick(1);

                InitFaultList();
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

        content += "<div class=\"list_l\"><a href=\"#\">";

        var faultcontent = unescape(FaultListObj[ len - i ].fault.fault_report);

            content += ShortenContent(faultcontent);

            content += "</a></div>";

            content += "<div class=\"list_r\"><a href=\"#\">" + MillionSecondToDate(FaultListObj[i].status.date.$date) + "</a></div>";

            content += "<div class=\"clear\"></div>";

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

    if ((content != "") && (OldExhibitionHall != null) && (OldExhibitionPlace != null)) {

        SaveButtonObj.innerHTML = "<a href=\"#\"><img src=\"images/btn.jpg\" border=\"0\" onclick=\"SaveClick()\"/></a>";

    }
    else {

        SaveButtonObj.innerHTML = "<a href=\"#\"><img src=\"images/btn_disable.jpg\" border=\"0\" /></a>";
    }
}

function CheckPageButton() {
    if (TotalPage > 1) {
        if (CurrentPage == 0) {
            document.getElementById("FirstPage").src = "images/first_disable.jpg";

            document.getElementById("PrevPage").src = "images/prev_disable.jpg";

            document.getElementById("NextPage").src = "images/next.jpg";

            document.getElementById("LastPage").src = "images/last.jpg";
        }
        else if ((CurrentPage > 0) && (CurrentPage < (TotalPage - 1))) {
            document.getElementById("FirstPage").src = "images/first.jpg";

            document.getElementById("PrevPage").src = "images/prev.jpg";

            document.getElementById("NextPage").src = "images/next.jpg";

            document.getElementById("LastPage").src = "images/last.jpg";
        }
        else {
            document.getElementById("FirstPage").src = "images/first.jpg";

            document.getElementById("PrevPage").src = "images/prev.jpg";

            document.getElementById("NextPage").src = "images/next_disable.jpg";

            document.getElementById("LastPage").src = "images/last_disable.jpg";
        }
    }
}

function FirstPageClick() {

    var begin,end;

    CurrentPage = 0;

    begin = 0;

    end = (CurrentPage + 1) * ShowFaultCount;

    end = end > FaultListObj.length ? FaultListObj.length : end;

    InitFaultListDiv(begin, end);

    CheckPageButton();
}

function PrevPageClick() {

    var begin, end;

    var OldPage = CurrentPage;

    CurrentPage--;

    if (CurrentPage >= 0) {

        begin = CurrentPage * ShowFaultCount;

        end = OldPage * ShowFaultCount;

        InitFaultListDiv(begin, end);
    }
    else {
        CurrentPage = 0;
    }

    CheckPageButton();
}

function NextPageClick() {

    var begin, end;

    var OldPage = CurrentPage;

    CurrentPage++;

    if (CurrentPage < TotalPage) {

        begin = CurrentPage * ShowFaultCount;

        end = (CurrentPage + 1) * ShowFaultCount;

        end = end > FaultListObj.length ? FaultListObj.length : end;

        InitFaultListDiv(begin, end);

    }
    else {
        CurrentPage = TotalPage - 1;
    }

    CheckPageButton();
}

function LastPageClick() {

    var begin, end;

    CurrentPage = TotalPage - 1;

    begin = CurrentPage * ShowFaultCount;

    begin = begin < 0 ? 0 : begin;

    end = FaultListObj.length;

    InitFaultListDiv(begin, end);

    CheckPageButton();
}

$(function () {

    InitDivAndCSS();

    InitFaultList();

    InitExhibitionHall(1);

    ChangeRecordPosition();

})