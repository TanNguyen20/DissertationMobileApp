import moment from 'moment';
import 'moment/locale/vi';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import Theme from '../../theme/Theme';
import Loading from '../../components/Loading';
import { View, ScrollView } from 'react-native';
import StyleCommon from '../../theme/StyleCommon';
import useGetAllStore from '../../hooks/useGetAllStore';
import useGetInfoCustomer from '../../hooks/useGetInfoCustomer';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {
    Title, Text, Button, Headline, Switch,
    TextInput, Paragraph, HelperText
} from 'react-native-paper';

export default function ContactInfo({ route, navigation }) {
    const { data } = route.params;
    const [dataForm, setDataForm] = useState();
    const [loading, listStore] = useGetAllStore();
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const [loadingInfoCustomer, infoCustomer] = useGetInfoCustomer();

    const listCarePoint = listStore;

    const onToggleSwitch = () => {
        setIsSwitchOn(!isSwitchOn);
        if (!loadingInfoCustomer && !isSwitchOn) {
            formik.setFieldValue('name', infoCustomer.fullName);
            formik.setFieldValue('email', infoCustomer.email);
            formik.setFieldValue('phoneNumber', infoCustomer.phoneNumber);
        }
        if (isSwitchOn) {
            formik.handleReset();
        }
    };
    const handleSendRequest = async () => {
        if (dataForm) {
            let dataSend = { ...dataForm, ...data };
            if (!loadingInfoCustomer) {
                if (infoCustomer) {
                    dataSend.defaultEmail = infoCustomer.email;
                }
            }
            // console.log(dataSend);
            dataSend.totalPrice = Math.round(totalPrice * ((100 - data.percentSale) / 100))
            navigation.navigate("Checkout", { data: dataSend });
            // alert(JSON.stringify(dataSend));
        }
    };
    const ContactSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'T??n qu?? ng???n')
            .max(50, 'T??n qu?? d??i')
            .required('Vui l??ng nh???p t??n c???a b???n'),
        email: Yup.string().email('?????a ch??? email kh??ng h???p l???').required('Vui l??ng nh???p email'),
        phoneNumber: Yup.number().typeError('Vui l??ng nh???p s???').required('Vui l??ng nh???p s??? ??i???n tho???i').min(100000000, 'S??? ??i???n tho???i kh??ng h???p l???'),
        address: Yup.string().required('Vui l??ng nh???p ?????a ch???'),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phoneNumber: "",
            description: '',
            address: '',
        },
        validationSchema: ContactSchema,
        onSubmit: (values) => {
            // alert(JSON.stringify(values, null, 2));
            setDataForm(values);
        },
        onReset: () => {
            setDataForm(null);
        }
    });

    const carSize = {
        carSmall: "Xe nh???",
        carMedium: "Xe v???a",
        carLarge: "Xe l???n"
    };
    const combo = {
        combo1: "G??I L??M S???CH C?? B???N",
        combo2: "G??I L??M S???CH PREMIUM",
        combo3: "G??I L??M S???CH SUPER PREMIUM",
    };
    let totalPrice = 0;
    data.listServiceChoose.forEach((item) => {
        totalPrice += item.price;
    });
    totalPrice += 100000 * (data.carSize === "carMedium" ? 1 : 2);
    totalPrice += data.priceCombo;

    if (loading || loadingInfoCustomer == true) return <Loading.Origin color={Theme.colors.secondary} size={50} />;
    return (
        <>
            <ScrollView>
                <View style={StyleCommon.FlexCenter}>
                    <Headline>
                        Th??ng tin li??n h???
                    </Headline>
                    <View style={{
                        flex: 1, flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                        {loadingInfoCustomer !== 'error' && loadingInfoCustomer ==false ? <Switch value={isSwitchOn}
                            color={Theme.colors.secondary}
                            onValueChange={onToggleSwitch} /> : null}
                    </View>
                </View>
                <View style={{ marginHorizontal: 20 }}>
                    <TextInput
                        name="name"
                        label="H??? t??n"
                        mode="outlined"
                        value={formik.values.name}
                        style={StyleCommon.TextInputMarginVertical}
                        onChangeText={text => formik.setFieldValue('name', text)}
                    />
                    <HelperText type="error" visible={formik.touched.name && Boolean(formik.errors.name)}>
                        {formik.touched.name && formik.errors.name}
                    </HelperText>
                    <TextInput
                        label="?????a ch??? email"
                        name="email"
                        mode="outlined"
                        keyboardType="email-address"
                        value={formik.values.email}
                        style={StyleCommon.TextInputMarginVertical}
                        onChangeText={text => formik.setFieldValue('email', text)}
                    />
                    <HelperText type="error" visible={formik.touched.email && Boolean(formik.errors.email)}>
                        {formik.touched.email && formik.errors.email}
                    </HelperText>
                    <TextInput
                        name="phoneNumber"
                        label="S??? ??i???n tho???i"
                        keyboardType="numeric"
                        mode="outlined"
                        value={formik.values.phoneNumber}
                        style={StyleCommon.TextInputMarginVertical}
                        onChangeText={text => formik.setFieldValue('phoneNumber', text)}
                    />
                    <HelperText type="error" visible={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}>
                        {formik.touched.phoneNumber && formik.errors.phoneNumber}
                    </HelperText>
                    <TextInput
                        name="address"
                        label="?????a ch???"
                        mode="outlined"
                        value={formik.values.address}
                        style={StyleCommon.TextInputMarginVertical}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={text => formik.setFieldValue('address', text)}
                    />
                    <HelperText type="error" visible={formik.touched.address && Boolean(formik.errors.address)}>
                        {formik.touched.address && formik.errors.address}
                    </HelperText>
                    <TextInput
                        label="Y??u c???u ph???c v???"
                        mode="outlined"
                        name="description"
                        value={formik.values.description}
                        style={StyleCommon.TextInputMarginVertical}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={text => formik.setFieldValue('description', text)}
                    />
                    <Button mode="contained"
                        style={{ marginVertical: 20 }}
                        color={Theme.colors.secondary}
                        onPress={formik.handleSubmit}>
                        X??c nh???n
                    </Button>
                </View>
                <View style={{ ...StyleCommon.FlexCenter, marginVertical: 20 }}>
                    <Headline>
                        Ki???m tra l???i th??ng tin
                    </Headline>
                </View>
                <View style={StyleCommon.marginHorizontalDefault}>
                    <Title>
                        C???a h??ng ph???c v???
                    </Title>
                    <Text>{listCarePoint[parseInt(data.carePoint) - 1].name}</Text>
                    <Title>
                        K??ch c??? xe
                    </Title>
                    <Text>
                        {carSize[data.carSize]} {data.carSize !== "carSmall" ? "(Ph??? thu th??m " +
                            (100000 * (data.carSize === "carMedium" ? 1 : 2))
                                .toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '???' + ")" : null}
                    </Text>
                    {data.combo === "" ? null : <>
                        <Title>G??i combo t??y ch???n</Title>
                        <Text>{combo[data.combo]} ({data.priceCombo.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '???'})</Text>
                    </>}

                    <Title>
                        D???ch v??? ???? ch???n
                    </Title>
                    {data.listServiceChoose.map((item, index) => {
                        return <Paragraph key={index} style={{
                            padding: 8,
                            fontSize: 16,
                        }}><FontAwesome5 name="dot-circle" size={14} color={Theme.colors.primary} /> {item.productName} (Gi?? d???ch v???: {item.price.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '???'})
                        </Paragraph>
                    })
                    }
                    <Title>
                        T???ng ti???n: <Text style={{ color: Theme.colors.secondary }}>{Math.round(totalPrice * ((100 - data.percentSale) / 100)).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '??? '}</Text>
                        {data.percentSale > 0 ? <Text style={{ fontSize: 14 }}>(???? gi???m {data.percentSale}%)</Text> : null}
                    </Title>
                    <Title>
                        Th???i gian h???n: <Text style={{ color: Theme.colors.secondary }}>{moment(new Date(data.time)).locale('vi').format('LLLL')}</Text>
                    </Title>
                    <View style={{ ...StyleCommon.FlexCenter, marginVertical: 20 }}>
                        <Headline>
                            Th??ng tin ng?????i ?????t
                        </Headline>
                    </View>
                    {
                        dataForm ?
                            <View>
                                <Title>
                                    T??n ng?????i ?????t: {dataForm.name}
                                </Title>
                                <Title>
                                    Email: {dataForm.email}
                                </Title>
                                <Title>
                                    S??? ??i???n tho???i: {dataForm.phoneNumber}
                                </Title>
                                <Title>
                                    ?????a ch???: {dataForm.address}
                                </Title>
                                <Title>
                                    Y??u c???u: {dataForm.description}
                                </Title>
                                <Button mode="contained"
                                    icon="card-bulleted"
                                    style={{ marginVertical: 20 }}
                                    color={Theme.colors.secondary}
                                    onPress={handleSendRequest} >
                                    Chuy???n sang thanh to??n
                                </Button>
                            </View> : null
                    }
                </View>
            </ScrollView>
        </>
    );
}