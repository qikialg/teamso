function generateReplyItem(content_text, commitDate) {
    var oldContentCommitDate = new Date(commitDate);
    var htmlTag = "<div class=\"detail_old\"><div class=\"detail_old_t\"></div><div class=\"detail_old_m\">";
    htmlTag += content_text;
    htmlTag += "<div class=\"text_r\">";
    htmlTag += oldContentCommitDate.getFullYear() + "年" + oldContentCommitDate.getMonth() + "月" + oldContentCommitDate.getDate() + "日 " + oldContentCommitDate.toLocaleTimeString();
    htmlTag += "</div></div><div class=\"detail_old_b\"></div></div>";

    return htmlTag;
}

function showFaultDetail(data) {
    var faults = JSON.parse(data);
    var nfaults = 0;
    if (faults != null) {
        nfaults = faults.length;

        if (nfaults > 0) {
            // show fault detail
            var firstcommentid = nfaults - 1;
            var firstContent = faults[firstcommentid];
            var mainContent = $("#fault_content");
            mainContent.html("");
            var unescaptedContent = RN2BR(htmldeescape(unescape(firstContent.content)));
            mainContent.append("<b>" + firstContent.floor_name + "</b> > <b>" + firstContent.hall_name + "</b> > <b>" + firstContent.subject_name + "</b><br />");
            mainContent.append("<div id=\"status_desc\"><h2>" + N2FaultName(faults[0].status) + "</h2></div>");
            mainContent.append(unescaptedContent + "<br/>");

            var commitDate = new Date(firstContent.date.$date);
            mainContent.append("<div class=\"text_r\">" + commitDate.getFullYear() + "年" + commitDate.getMonth() + "月" + commitDate.getDate() + "日 " + commitDate.toLocaleTimeString() + "</div>");

            //  show commit content
            var id = firstcommentid - 1;
            var oldContent = $("#old_content");

            for (; id >= 0; id--) {
                var unescapedOldContent = RN2BR(htmldeescape(unescape(faults[id].content)));
                var htmlTag = generateReplyItem(unescapedOldContent, faults[id].date.$date);
                oldContent.append(htmlTag);
            }

            //  append scrollbar
            oldContent.mCustomScrollbar();
        }
    }
}

function showDetail(par) {
    var requestPar = { oc: "ffs", oid: par };
    var requestUrl = TCPRequestHeader + ServerAddr + ":" + appPort + "/" + eventBusiness;

    $.ajax({
        type: "POST",
        url: requestUrl,
        data: requestPar,
        success: function (data) {
            showFaultDetail(data);
        }
    });
}

function onDetailPageLoad() {
    var par = getParInURL("oid");
    if (par != null) {
        showDetail(par);
    }
}

//  commit new state
var textContentIsEmpty = true;
function showDefaultText(newState) {
    var textCtrl = $("#text_content");

    if (textCtrl.val().length <= 0) {
        textContentIsEmpty = true;
        switch (newState) {
            case 4: //is fault
                textCtrl.val("核实，是故障");
                break;
            case 8: //  is no a fault
                textCtrl.val("核实，不是故障");
                break;
            case 32://  turning off
                textCtrl.val("设备没有开启");
                break;
            case 16://    duplicated
                textCtrl.val("该报修重复");
                break;
            case 64://  processing   
                textCtrl.val("故障正在处理");
                break;
            case 512:
                textCtrl.val("故障已修复");
                break;
        }// end break;
    }
    else {
        textContentIsEmpty = false;
    }
}

//  when move out text content, reset the control
function resetTextContent() {
    var textCtrl = $("#text_content");
    if (textContentIsEmpty) {
        textCtrl.val("");
    }
}

function animateAppend(htmlText) {
    //  disable reply items

    var newElement = document.createElement("div");
    var width = $("#old_content").css("width");
    var left = "50px";
    var top = "0px";
    $(newElement).css("width", width)
        .css("position", "absolute")
        .css("left", left)
        .css("top", top)
        .append(htmlText)
        .appendTo($("#bgbox"));
    
    var oldContentWidget = $("#old_content");
    var lastDivPos = oldContentWidget.position();
    var newElementPos = $(newElement).position();
    var animateLeft = lastDivPos.left - newElementPos.left;
    var animateTop = lastDivPos.top - newElementPos.top;
    
    var relativeLeft = "+=" + animateLeft + "px";
    var relativeTop = "+=" + animateTop + "px";
    $(newElement).animate({
        left: relativeLeft,
        top: relativeTop,
        opacity:'0'
    },
    1500,
    function () {
        $(newElment).remove();

    });
}

function onNewStateCommit(newState) {
    var textCtrl = $("#text_content");
    var stroid = getParInURL("oid");
    var requestUrl = TCPRequestHeader + ServerAddr + ":" + appPort + "/" + eventBusiness;
    var orgContent = textCtrl.val();
    var escapedContent = escape(orgContent);
    var requestData = { oc: "ses", oid: stroid, newstate: newState, content: escapedContent };
    $.ajax({
        type: "POST",
        url: requestUrl,
        data: requestData,
        success: function (data) {
            if (data == 1) {
                //  show new commitment
                var htmlTag = generateReplyItem(RN2BR(orgContent), new Date());
                animateAppend(htmlTag);
                $(htmlTag).hide()
                    .appendTo("#old_content .mCSB_container")
                    .fadeIn(1500, 
                    function () {
                        //  update content area
                        $("#old_content").mCustomScrollbar("update");
                        $("#old_content").mCustomScrollbar("scrollTo", "bottom");
                    });
               
                //  empty user input
                textCtrl.val("");

                //  reset status description
                var descTag = $("#status_desc");
                descTag.html("");
                descTag.html("<h2>" + N2FaultName(newState) + "</h2>");
            }
        }
    });
}