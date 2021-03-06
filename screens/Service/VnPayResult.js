import moment from 'moment';
import 'moment/locale/vi';
import { useEffect } from 'react';
import Theme from '../../theme/Theme';
import Loading from '../../components/Loading';
import { View, ScrollView } from 'react-native';
import StyleCommon from '../../theme/StyleCommon';
import {
    Title, Text, Button, Headline
} from 'react-native-paper';
import useGetVnpReturnUrl from '../../hooks/useGetVnpReturnUrl';
import FormApi from '../../api/formApi';

export default function VnPayResult({ route, navigation }) {

    let indexUrl = route.params.data.indexOf("/vnpReturnUrl");
    let paramsVnpUrlReturn = route.params.data.split(route.params.data.substring(0, indexUrl) + "/vnpReturnUrl")[1];
    const [loading, data] = useGetVnpReturnUrl(paramsVnpUrlReturn);
    useEffect(() => {
        FormApi.getVnpIpn(paramsVnpUrlReturn).then(res => {
            if (data.vnp_OrderInfo) {
                if (data.vnp_OrderInfo.length > 0) {
                    if (res.RspCode === "00") {
                        let idOrder = (data.vnp_OrderInfo).split('Thanh+toan+dich+vu+oto+viet+cho+don+hang+')[1];
                        // console.log('id order ne:......',idOrder);
                        FormApi.getOrderById(idOrder).then(res => {
                            if (res.isPaid === false) {
                                FormApi.updatePayStatuslOrder(idOrder).then(res => {
                                    console.log(res);
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    }
                }
            }
        })
        .catch(err => {
            console.log(err);
        });

    }, [loading]);

    if (loading) return <Loading.Origin color={Theme.colors.secondary} size={50} />;
    let infoPayment = data.vnp_OrderInfo.split('+').join(' ');
    let statusPayment = "Th???t b???i";
    switch (data.vnp_ResponseCode) {
        case "00":
            statusPayment = "Th??nh c??ng";
            break;
        case "07":
            statusPayment = "Th???t b???i do giao d???ch b??? nghi ng??? (li??n quan t???i l???a ?????o, giao d???ch b???t th?????ng).";
            break;
        case "09":
            statusPayment = "Th???t b???i do th???/T??i kho???n c???a kh??ch h??ng ch??a ????ng k?? d???ch v??? InternetBanking t???i ng??n h??ng.";
            break;
        case "10":
            statusPayment = "Th???t b???i do kh??ch h??ng x??c th???c th??ng tin th???/t??i kho???n kh??ng ????ng qu?? 3 l???n";
            break;
        case "11":
            statusPayment = "Th???t b???i do ???? h???t h???n ch??? thanh to??n.";
            break;
        case "12":
            statusPayment = "Th???t b???i do th??? b??? kh??a";
            break;
        case "13":
            statusPayment = "Th???t b???i do kh??ch nh???p sai m???t kh???u x??c th???c giao d???ch (OTP)";
            break;
        case "24":
            statusPayment = "Th???t b???i do kh??ch h??ng h???y giao d???ch";
            break;
        case "51":
            statusPayment = "Th???t b???i do t??i kho???n c???a qu?? kh??ch kh??ng ????? s??? d?? ????? th???c hi???n giao d???ch.";
            break;
        case "65":
            statusPayment = "Th???t b???i do t??i kho???n c???a Qu?? kh??ch ???? v?????t qu?? h???n m???c giao d???ch trong ng??y.";
            break;
        case "75":
            statusPayment = "Th???t b???i do ng??n h??ng thanh to??n ??ang b???o tr??."
            break;
        case "79":
            statusPayment = "Th???t b???i do nh???p sai m???t kh???u thanh to??n qu?? s??? l???n quy ?????nh. Xin qu?? kh??ch vui l??ng th???c hi???n l???i giao d???ch"
            break;
        default:
            statusPayment = "Th???t b???i do l???i h??? th???ng";
            break;
    }

    return (
        <>
            <ScrollView>
                <View style={{ ...StyleCommon.FlexCenter, marginVertical: 20 }}>
                    <Headline>
                        Th??ng tin giao d???ch
                    </Headline>
                </View>
                <View style={StyleCommon.marginHorizontalDefault}>
                    <Title>
                        M?? c???a h??ng(???????c c???p b???i VNPAY)
                    </Title>
                    <Text>{data.vnp_TmnCode}</Text>
                    <Title>
                        M?? giao d???ch
                    </Title>
                    <Text>
                        {data.vnp_TxnRef}
                    </Text>
                    <Title>
                        N???i dung giao d???ch
                    </Title>
                    <Text>{infoPayment}</Text>
                    <Title>
                        Th???i gian thanh to??n
                    </Title>
                    <Text>{moment(data.vnp_PayDate, "YYYYMMDDHHmmss").format("DD/MM/YYYY HH:mm:ss")}</Text>
                    <Title>
                        T???ng ti???n thanh to??n
                    </Title>
                    <Text>{Math.round(parseInt(data.vnp_Amount) / 100).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '??? '}</Text>
                    <Title>Tr???ng th??i giao d???ch</Title>
                    <Text>{statusPayment}</Text>
                    <Button icon="home" mode="contained"
                    style={{marginTop:20}}
                    onPress={() => navigation.navigate('Home')}>
                        Tr??? v??? trang ch???
                    </Button>
                </View>
            </ScrollView>
        </>
    );
}