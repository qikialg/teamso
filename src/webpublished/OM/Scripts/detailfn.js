function showFaultDetail(data) {
    var faults = JSON.parse(data);
    var nfaults = 0;
    if (faults != null) {
        nfaults = faults.length;

        var firstcommentid = nfaults - 1;
        var firstContent = faults[firstcommentid];
        var mainContent = $("#fault_content");
        mainContent.html("");
        var unescaptedContent = RN2BR(htmldeescape(unescape(firstContent.content)));
        mainContent.append("<b>" + firstContent.floor_name + "</b> > <b>" + firstContent.hall_name + "</b> > <b>" + firstContent.subject_name + "</b><br />");
        mainContent.append("<h2>" + N2FaultName(firstContent.status) + "</h2>");
        mainContent.append(unescaptedContent + "<br/>");
        
        var commitDate = new Date(firstContent.date.$date);
        mainContent.append("<div class=\"text_r\">" + commitDate.getFullYear() + "年" + commitDate.getMonth() + "月" + commitDate.getDate() + "日 " + commitDate.toLocaleTimeString() +"</div>");
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

