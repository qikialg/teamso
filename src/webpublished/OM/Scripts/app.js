var ServerAddr = "113.12.226.243";
var appPort = "9006";
var TCPRequestHeader = "http://";
var eventBusiness = "eventelement.aspx";
var faultNameMap = new Array("新故障", "未读", "是故障", "非故障", "重复报修", "未开启", "处理中", "已上报", "厂商维修中", "厂商维修完毕");
function N2FaultName(code) {
    var name = "unknow";
    
    var id = Math.round(Math.LOG2E * Math.log(code));
    name = faultNameMap[id];
    return name;
}