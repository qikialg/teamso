var ServerAddr = "113.12.226.243";
var appPort = "9006";
var TCPRequestHeader = "http://";
var eventBusiness = "eventelement.aspx";
var faultNameMap = new Array("�¹���", "δ��", "�ǹ���", "�ǹ���", "�ظ�����", "δ����", "������", "���ϱ�", "����ά����", "����ά�����");
function N2FaultName(code) {
    var name = "unknow";
    
    var id = Math.floor(Math.E * Math.log(code));
    name = faultNameMap[id];
    return name;
}