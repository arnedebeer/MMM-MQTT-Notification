
Module.register("MMM-MQTT-Notification", {

    // Default module config
    defaults: {
        mqttServers: []
    },

    makeServerKey: function (server) {
        return '' + server.address + ':' + (server.port | '1883' + server.user);
    },

    start: function () {
        console.log(this.name + ' started.');
        this.subscriptions = [];

        console.log(this.name + ': Setting up connection to ' + this.config.mqttServers.length + ' servers');

        for (i = 0; i < this.config.mqttServers.length; i++) {
            var s = this.config.mqttServers[i];
            var serverKey = this.makeServerKey(s);
            console.log(this.name + ': Adding config for ' + s.address + ' port ' + s.port + ' user ' + s.user);
            for (j = 0; j < s.subscriptions.length; j++) {
                var sub = s.subscriptions[j];
                this.subscriptions.push({
                    serverKey: serverKey,
                    notificationKey: sub.notificationKey,
                    topic: sub.topic
                });
            }
        }

        this.openMqttConnection();
        var self = this;
    },

    openMqttConnection: function () {
        this.sendSocketNotification('MQTT_CONFIG', this.config);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MQTT_PAYLOAD') {
            if (payload != null) {
                for (i = 0; i < this.subscriptions.length; i++) {
                    sub = this.subscriptions[i];
                    console.log(sub);
                    if (sub.serverKey == payload.serverKey && sub.topic == payload.topic) {
                        this.sendNotification(sub.notificationKey, payload.value);
                    }
                }
            } else {
                console.log(this.name + ': MQTT_PAYLOAD - No payload');
            }
        }
    },


});
