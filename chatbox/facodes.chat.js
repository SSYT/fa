
var fa_chatbox = function (method, data, callback) {
    this.method = method;
    this.data = data || {};
    this.callback = callback;
    this.read = {};

    switch(method) {
        case "read":
            $.ajax({
                url: '/post?p=19&mode=editpost',
                cache: false,
                data: data,
                type: "get",
                dataType: "text",
                success: callback
            });
            break;

        case "addMsg":
            $.ajax({
                url: '/post?p=19&mode=editpost',
                cache: false,
                data: data,
                type: "post",
                success: callback
            });
            break;
    }
    
    /*var default_params = {
        title: 'FACodes',
        avatars: false,
        refresh: 5000,
        cache: 30 * 60 * 1000,
        reload: true,
        autologin: true
    };

    $.extend(true, this.params, default_params);*/
};

fa_chatbox.prototype.init = function() {
    var self = this;

    fa_chatbox("read", {}, function(response) {
        if(/{"users":.+}]}/im.test(response)) {
            self.read = JSON.parse(/{"users":.+}]}/im.exec(response)[0]);
            console.log(self.read);
        }

        /*if(self.read.messages == null && self.read.users == null) {
            var date = new Date();
            var t = {"users": [{
                id: 1,
                user_color: '#E60C42',
                admin: 1,
                username: 'SSYT 2.0',
                staus: 1
            }], "messages": [{
                id: 0,
                user_color: '#E60C42',
                admin: 1,
                username: 'ChatBot',
                date: date.getDay()+'/'+ date.getMonth() +'/'+date.getFullYear(),
                dateTime: date.getHours()+':'+ date.getMinutes() +':'+date.getSeconds(),
                content: 'Welcome to FACodes, you have installed fa chatbox by SSYT.'}]
            };

            console.log(readMSG);

            fa_chatbox("addMsg", {
                subject: "database_chatbox",
                message: JSON.stringify(t),
                edit_reason: "",
                attach_sig: 0,
                notify: 0,
                post: 1
            }, function() {
                console.log('done');
            });
        }*/

        console.log('[SUCCESS] InitListening');
        self.autologin(_userdata.username);
        self.readData();
    });
};

fa_chatbox.prototype.autologin = function(user) {
    var self = this;
    for(var i in self.read.users) {
        if(_userdata.session_logged_in == 1) {
            if(self.read.users !== null && self.read.users[i].username == user) {
                console.log('login to chatbox');
                $('div#fa_chatbox_header > right').html('Disconnect').attr({
                    'onclick' : 'chat.disconect(\''+ _userdata.username +'\')',
                    'data-cookie' : 'true'
                });
            }
        } else {
            $('div#buttons').remove();
        }
    }
};

fa_chatbox.prototype.getUser = function(data, id) {
    if(data !== null) {
        for(var i in data) {
            if(data[i].username == id) {
                return 1;
            } else {
                return false;
            }
        }
    }
};

fa_chatbox.prototype.readData = function() {
    var self = this, content = null;
    fa_chatbox("read", {}, function(response) {
        if(!/{"users":.+}]}/im.test(response)) return;
        content = /{"users":.+}]}/im.exec(response);
        if(content !== null) self.getMessages(content);
    });
};

fa_chatbox.prototype.getMessages = function(content) {
    var self = this;

    if(this.content !== null) {
        var html = null;
        $.each(JSON.parse(content).messages, function(i, value) {
            html += "<p class='chatbox_row_" + (i % 2 == 1 ? 2 : 1) +" clearfix'>";
                html += "<span class='date-and-time' title='" + value.dateTime + "'>[" + value.date + "]</span>";
                html += "<span class='user' style='color:"+ value.user_color +"'>" +
                            "<strong>"+ 
                                (value.admin ? "@ " : "") +
                                "<span class='chatbox-username chatbox-message-username'  data-user='"+ value.id +"' >"+ value.username + "</span>&nbsp;:&nbsp;"+
                            "</strong>"+
                        "</span>"+
                        "<span class='msg'>"+
                            value.content
                        +"</span>"+
                    "</span>";
                html += "</p>";
        });
        document.getElementById('shouts').innerHTML = html.replace(/null/i, "");
        $("#shouts")[0].scrollTop = $("#shouts").prop('scrollHeight') * 2;
    }
};

fa_chatbox.prototype.send = function() {
    var self = this, date = new Date();
    if(document.getElementById('msg_zone').value == "") return;

    self.read.messages.push({
        id: _userdata.user_id,
        user_color: (self.getUser(self.read.users, _userdata.username) == 1) ? '#E60C42' : '#000',
        admin: (self.getUser(self.read.users, _userdata.username) == 1) ? 1 : 0,
        username: _userdata.username,
        date: date.getDay()+'/'+ date.getMonth() +'/'+date.getFullYear(),
        dateTime: date.getHours()+':'+ date.getMinutes() +':'+date.getSeconds(),
        content: document.getElementById('msg_zone').value
    });
    console.log(self.read.messages);
    document.getElementById('msg_zone').value = "";

    fa_chatbox("addMsg", {
        subject: "database_chatbox",
        message: JSON.stringify(self.read),
        edit_reason: "",
        attach_sig: 0,
        notify: 0,
        post: 1
    }, function() {
        self.readData();
    });
};

$(document).ready(function() {
    var chat = new fa_chatbox();
    $('input#msg_zone').keypress(function (e) {
        if (e.which == 13) {
            chat.send();
            return false;
        }
    });
});
