import { useState, useEffect, useRef } from 'react';
import Theme from '../../theme/Theme';
import * as Device from 'expo-device';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';
import { Headline, Title, Text, Caption, Button } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FormApi from '../../api/formApi';
import io from 'socket.io-client';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

function AfterPaymentScreen({ route, navigation }) {
    const { data } = route.params;
    const socket = io("https://luanvanapi.azurewebsites.net", { transports: ['websocket', 'polling', 'flashsocket'] });

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const handleClick = () => {
        socket.on("connect", () => {
            console.log(socket.id);
        });
        data.listServiceChoose = data.listServiceChoose.map((item, index) => {
            return { ...item, idProduct: item._id, id: index }
        });
        FormApi.createOrder(data)
            .then(resOrder => {
                let titleNotify = "C?? ????n h??ng m???i t??? " + data.name;
                let content = "ch??? x??c nh???n";
                FormApi.createNotification({
                    title: titleNotify, content: content,
                    from: data.email, type: "order",
                    expoPushToken: expoPushToken,
                    createdAt: resOrder.createdAt, detail: { idOrder: resOrder._id }
                })
                    .then(res => {
                        socket.emit('send', {
                            title: titleNotify, content: content,
                            from: data.email, type: "order",
                            createdAt: res.createdAt, detail: { idOrder: resOrder._id },
                            isRead: false
                        });
                        Alert.alert('Th??ng b??o', '???? g???i y??u c???u ch??m s??c xe th??nh c??ng!');
                        navigation.navigate('Home');
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Caption style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
                Vui l??ng ?????n ????ng gi??? ????? tr??nh b???t ti???n, ch??ng t??i s??? g???i cho b???n email nh???c nh??? tr?????c 1 ng??y ????? b???n thu x???p th???i gian
            </Caption>
            <Button icon="calendar-check" color={Theme.colors.secondary} mode="contained"
                onPress={handleClick}>
                X??c nh???n ?????t l???ch h???n
            </Button>
        </View>
    );
}
function VNPayScreen({ route, navigation }) {
    let { data } = route.params;
    const socket = io("https://luanvanapi.azurewebsites.net", { transports: ['websocket', 'polling', 'flashsocket'] });
    const [openWebview, setOpenWebview] = useState(false);
    const [url, setUrl] = useState('');

    const onNavigationStateChange = (webViewState) => {
        console.log(webViewState.url);
        if (webViewState.url.includes('localhost')) {
            setOpenWebview(false);
            Alert.alert('Th??ng b??o', '???? thanh to??n th??nh c??ng!');
            navigation.navigate('VnPayReturn', { data: webViewState.url });
        }
    };
    const handlePress = () => {
        data.listServiceChoose = data.listServiceChoose.map((item, index) => {
            return { ...item, idProduct: item._id, id: index }
        });
        FormApi.createOrder(data)
            .then(resOrder => {
                let titleNotify = "C?? ????n h??ng m???i t??? " + data.name;
                let content = "ch??? x??c nh???n";
                FormApi.createNotification({
                    title: titleNotify, content: content,
                    from: data.email, type: "order",
                    createdAt: resOrder.createdAt, detail: { idOrder: resOrder._id }
                })
                .then(res => {
                    socket.emit('send', {
                        title: titleNotify, content: content,
                        from: data.email, type: "order",
                        createdAt: res.createdAt, detail: { idOrder: resOrder._id },
                        isRead: false
                    });
                    fetch('https://luanvanapi.azurewebsites.net/api/order/create_payment_url', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orderType: 'vehicle',
                            orderDescription: 'Thanh toan dich vu oto viet cho don hang '+resOrder._id,
                            bankCode: '',
                            amount: data.totalPrice,
                            language: 'vn'
                        })
                    })
                    .then(response => response.json())
                    .then(responseJson => {
                        if (responseJson.vnpUrl) {
                            setUrl(responseJson.vnpUrl);
                            setOpenWebview(true);
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
                })
                .catch(err => {
                    console.log(err);
                });
            })
            .catch(err => {
                console.log(err);
            });
    };
    if (openWebview) return <WebView
        onNavigationStateChange={onNavigationStateChange}
        javaScriptEnabled
        domStorageEnabled
        source={{ uri: url }} />;
    return (

        <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20 }}>
            <Title style={{ textAlign: 'center', marginBottom: 20 }}>Thanh to??n tr???c tuy???n d??? d??ng v???i VNPAY</Title>
            <Button icon="wallet" color={Theme.colors.secondary} mode="contained"
                onPress={handlePress}>
                Thanh to??n v???i VNPay
            </Button>
            <Caption style={{ fontSize: 18, textAlign: 'center', marginTop: 20 }}>Nhanh ch??ng, an to??n v?? ti???n l???i h??n</Caption>
        </View>
    )
}

function BankingScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20 }}>
            <Headline>Th??ng tin ng?????i nh???n</Headline>
            <Title>T??n Ng??n H??ng</Title>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>Sacombank</Text>
            <Title>Chi nh??nh</Title>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>PGD Ninh Ki???u (C???n Th??)</Text>
            <Title>T??n Ng?????i Th??? H?????ng</Title>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>CTY TNHH 1TV OTOVIET</Text>
            <Title>S??? T??i Kho???n</Title>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>070435430207</Text>
            <Caption style={{ fontSize: 18, textAlign: 'center' }}>Ch??ng t??i s??? x??c nh???n v???i b???n sau khi b???n chuy???n kho???n th??nh c??ng!</Caption>
        </View>
    )
}

const Tab = createMaterialTopTabNavigator();

export default function App({ route, navigation }) {
    const { data } = route.params;
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarLabelStyle: { fontSize: 12, color: 'white' },
                tabBarStyle: { backgroundColor: 'black' },
                tabBarItemStyle: { color: 'white' },
                tabBarIndicatorStyle: { backgroundColor: Theme.colors.secondary, height: 4 },
                tabBarIcon: ({ focused }) => {
                    if (route.name === 'AfterPayment') {
                        return (
                            <MaterialCommunityIcons
                                name={
                                    focused
                                        ? 'credit-card'
                                        : 'credit-card-outline'
                                }
                                size={26}
                                color={Theme.colors.secondary}
                            />
                        );
                    } else if (route.name === 'VNPAY') {
                        return (
                            <MaterialCommunityIcons
                                name={focused ? 'wallet' : 'wallet-outline'}
                                size={26}
                                color={Theme.colors.secondary}
                            />
                        );
                    }
                    else {
                        return (
                            <MaterialCommunityIcons
                                name={focused ? 'bank' : 'bank-outline'}
                                size={26}
                                color={Theme.colors.secondary}
                            />
                        );
                    }
                },
                tabBarInactiveTintColor: Theme.colors.primary,
                tabBarActiveTintColor: Theme.colors.secondary,
            })}
        >
            <Tab.Screen name="AfterPayment" component={AfterPaymentScreen}
                initialParams={{ data: data }}
                options={{ title: 'Thanh to??n sau' }} />
            <Tab.Screen name="VNPAY" component={VNPayScreen}
                initialParams={{ data: data }}
                options={{ title: 'V?? ??i???n t??? VNPay' }}
            />
            <Tab.Screen name="Banking" component={BankingScreen}
                options={{ title: 'Chuy???n kho???n tr???c ti???p' }}
            />
        </Tab.Navigator>
    );
}
