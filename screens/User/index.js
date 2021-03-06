import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Theme from '../../theme/Theme';
import InfoTab from './Tabs/InfoAndLogout';
import ChangePassword from './Tabs/ChangePassword';
import ChangeInfoTab from './Tabs/ChangeInfo';
const Tab = createBottomTabNavigator();

export default function Detail() {
    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused }) => {
                        if (route.name === 'ChangeInfo') {
                            return (
                                <MaterialCommunityIcons
                                    name={
                                        focused
                                            ? 'file-document-edit'
                                            : 'file-document-edit-outline'
                                    }
                                    size={30}
                                    color={Theme.colors.secondary}
                                />
                            );
                        }
                        if(route.name === 'ChangePassword'){
                            return (
                                <MaterialCommunityIcons
                                    name={
                                        focused
                                            ? 'account-key'
                                            : 'account-key-outline'
                                    }
                                    size={30}
                                    color={Theme.colors.secondary}
                                />
                            );
                        }
                        else {
                            return (
                                <MaterialCommunityIcons
                                    name={focused ? 'information' : 'information-outline'}
                                    size={30}
                                    color={Theme.colors.secondary}
                                />
                            );
                        }
                    },
                    tabBarInactiveTintColor: Theme.colors.primary,
                    tabBarActiveTintColor: Theme.colors.secondary,
                })}
            >
                <Tab.Screen name="Info" component={InfoTab}
                    options={{ title: "Th??ng tin ng?????i d??ng", headerShown: false }} />
                <Tab.Screen name="ChangePassword" component={ChangePassword}
                    options={{ title: "?????i m???t kh???u", headerShown: false }} />
                <Tab.Screen
                    name="ChangeInfo"
                    component={ChangeInfoTab}
                    options={{
                        headerShown: false,
                        title: "C???p nh???t th??ng tin",
                    }}
                />
            </Tab.Navigator>
        </>
    );
}