
// Project: https://github.com/blargoner/jshue
// Definitions by: firmanjml <https://github.com/firmanjml>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'jshue' {

    type ID = string | number;
    type IP = string;

    type AlertType = 'none' | 'select' | 'lselect';
    type EffectType = 'none' | 'colorloop';
    type ColorType = 'hs' | 'xy' | 'ct';

    type RoomClassType = "Living room" | "Kitchen" | "Dining" | "Bedroom" | "Kids bedroom" | "Bathroom" | "Nursery" | "Recreation" | "Office" | "Gym" | "Hallway" | "Toilet" | "Front door" | "Garage" | "Terrace" | "Garden" | "Driveway" | "Carport" | "Other" | "Home" | "Downstairs" | "Upstairs" | "Top floor" | "Attic" | "Guest room" | "Staircase" | "Lounge" | "Man cave" | "Computer" | "Studio" | "Music" | "TV" | "Reading" | "Closet" | "Storage" | "Laundry room" | "Balcony" | "Porch" | "Barbecue" | "Pool";

    interface NUPNPType {
        id: ID;
        internalipaddress: IP;
    }

    interface CreateUserType {
        success: {
            username: string;
        }
    }

    interface SuccessType {
        success: string;
    }

    interface SuccessWithKeyType {
        success: {
            [key: string]: any;
        }
    }

    interface ConfigurationType {
        name: string;
        swupdate?: {
            checkforupdate: boolean;
            devicetypes: {
                bridge: boolean;
                lights: Array<string>;
                sensors: Array<string>;
            };
            updatestate: 0 | 1 | 2 | 3;
            notify: boolean;
            url: string;
            text: string;
        }; //deprecated as on version 1.20 and above
        swupdate2:  {
            bridge: {
                state: string;
                lastinstall: string;
            };
            checkforupdate: boolean;
            install: boolean;
            autoinstall: {
                on: boolean;
                updatetime: string;
            };
            lastchange: string;
            state: 'unknown' | 'noupdates' | 'transferring' | 'anyreadytoinstall' | 'allreadytoinstall' | 'installing';
            lastinstall: string;
        };
        whitelist: {
            [key: string]: {
                "last use date": string;
                "create date": string;
                name: string;
            }
        };
        portalstate: {
            signedon: boolean;
            incoming: boolean;
            outgoing: boolean;
            communication: string;
        };
        apiversion: string;
        swversion: string;
        proxyaddress: string;
        proxyport: number;
        linkbutton: boolean;
        ipaddress: string;
        mac: string;
        netmask: string;
        gateway: string;
        dhcp: boolean;
        portalservices: boolean;
        UTC: string;
        localtime: string;
        timezone: string;
        zigbeechannel: number;
        modelid: string;
        bridgeid: string;
        factorynew: boolean;
        replacebridgeid: string;
        datastoreversion: string;
        starterkitid: string;
        backup: {
            status: 'idle' | 'startmigration' | 'fileready_disabled' | 'prepare_restore' | 'restoring';
            errorcode: number;
        }
        internetservices: {
            internet: 'connected' | 'disconnected';
            remoteaccess: 'connected' | 'disconnected';
            time: 'connected' | 'disconnected';
            swupdate: 'connected' | 'disconnected';
        }
    }

    interface ConfigurationBodyType {
        proxyport?: number;
        name?: string;
        swupdate?: object;
        proxyaddress?: string;
        linkbutton?: boolean;
        ipaddress?: string;
        netmask?: string;
        gateway?: string;
        dhcp?: boolean;
        UTC?: string;
        timezone?: string;
        touchlink?: boolean;
        zigbeechannel?: 11 | 15 | 20 | 25;
    }

    interface FullStateType {
        lights: object;
        groups: object;
        config: ConfigurationType;
        schedules: object;
        scenes: object;
        sensors: object;
        rules: object;
    }

    interface LightsType {
        [key: string]: LightType
    }

    interface LightType {
        state: {
            on: boolean;
            bri: number;
            hue: number;
            sat: number;
            effect: EffectType;
            xy: Array<number>;
            ct: number;
            alert: AlertType;
            colormode: ColorType;
            mode: string;
            reachable: boolean;
        },
        swupdate: {
            state: 'unknown' | 'noupdates' | 'transferring' | 'anyreadytoinstall' | 'allreadytoinstall' | 'installing';
            lastinstall: string;
        },
        type: string;
        name: string;
        modelid: string;
        manufacturername: string;
        productname: string;
        capabilities: {
            certified: boolean;
            control: {
                mindimlevel: number;
                maxlumen: number;
                colorgamuttype: string;
                colorgamut: Array<Array<number>>;
                ct: {
                    min: number;
                    max: number;
                }
            },
            streaming: {
                renderer: boolean;
                proxy: boolean;
            }
        },
        config: {
            archetype: string;
            function: string;
            direction: string;
        },
        uniqueid: string;
        swversion: string;
    }

    interface LightBodyType {
        on?: string;
        bri?: number;
        hue?: number;
        sat?: number;
        xy?: Array<number>;
        ct?: number;
        alert?: AlertType;
        effect?: EffectType;
        transitiontime?: number;
        bri_inc?: number;
        sat_inc?: number;
        hue_inc?: number;
        ct_inc?: number;
        xy_inc?: Array<number>
    }

    interface LightAttributeBodyType {
        name?: string;
    }

    interface NewLightType {
        lastscan: string;
    }

    interface SearchLightBodyType {
        deviceid: Array<string>
    }

    interface GroupsType {
        [key: string]: GroupType
    }

    interface GroupType {
        name: string;
        lights: Array<string>;
        type: string;
        class: string;
        action: {
            on: boolean;
            bri: number;
            hue: number;
            sat: number;
            effect: EffectType;
            xy: Array<number>;
            ct: number;
            alert: AlertType;
            colormode: ColorType;
        }
    }

    interface CreateGroupBodyType {
        lights?: Array<string>;
        name?: string;
        type?: string;
        class?: RoomClassType;
    }

    interface GroupAttributeBodyType {
        lights?: Array<string>;
        name?: string;
        class?: RoomClassType;
    }

    interface GroupBodyType {
        on?: boolean;
        bri?: number;
        hue?: number;
        sat?: number;
        xy?: Array<number>;
        ct?: number;
        alert?: AlertType;
        effect?: EffectType;
        transitiontime?: number;
        bri_inc?: number;
        sat_inc?: number;
        hue_inc?: number;
        ct_inc?: number;
        xy_inc?: number;
        scene?: string;
    }

    interface SchedulesType {
        [key: string]: ScheduleType
    }

    interface ScheduleType {
        name: string;
        description: string;
        command: {
            address: string;
            body: {
                scene: string;
            },
            method: "PUT" | "DELETE" | "POST"
        },
        time: string;
        created: string;
        status: "enabled" | "disabled";
        autodelete: boolean;
        starttime: string;
    }

    interface CreateOrSetScheduleBody {
        name?: string;
        description?: string;
        command?: object;
        time?: string;
        status?: "enabled" | "disabled";
        autodelete?: boolean;
        localtime?: string;
        recycle?: boolean
    }

    interface ScenesType {
        [key: string]: SceneType
    }

    interface SceneType {
        name: string;
        lights: Array<string>;
        owner: string;
        recycle: boolean;
        locked: boolean;
        appdata: {
            version: number;
            data: string;
        };
        picture: string;
        lastupdated: string;
        version: number;
    }

    interface CreateOrUpdateSceneBodyType {
        name: string;
        recycle: boolean;
        group?: string;
        type?: "GroupScene" | "LightScene";
        lights: Array<string>;
    }

    interface LightSceneBodyType {
        name: string;
        lights: Array<string>;
        appdata: {
            version: number;
            data: string;
        },
        lightstate: {
            [key: string]: {
                on: boolean;
                bri: number;
                xy: Array<number>
            }
        }
    }

    interface IHue {
        discover: () => Promise<Array<NUPNPType>>,
        bridge: (ip: IP) => {
            createUser: (type: string) => Promise<Readonly<Array<CreateUserType>>>,
            user: (username: string) => {
                deleteUser: (username: string) => Promise<Readonly<SuccessType>>,
                getConfig: () => Promise<Readonly<ConfigurationType>>,
                setConfig: (data: ConfigurationBodyType) => Promise<Readonly<SuccessWithKeyType>>,
                getFullState: () => Promise<Readonly<FullStateType>>,
                getLights: () => Promise<Readonly<LightsType>>,
                getNewLights: () => Promise<Readonly<object>>,
                searchForNewLights: (data?: SearchLightBodyType) => Promise<Readonly<SuccessWithKeyType>>,
                getLight: (id: ID) => Promise<Readonly<LightType>>,
                setLight: (id: ID, data: LightAttributeBodyType) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                setLightState: (id: ID, data: LightBodyType) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                deleteLight: (id: ID) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                getGroups: () => Promise<Readonly<GroupsType>>,
                createGroup: (data: CreateGroupBodyType) => Promise<Readonly<GroupType>>,
                getGroup: (id: ID) => Promise<Readonly<GroupType>>,
                setGroup: (id: ID, data: GroupAttributeBodyType) => Promise<Readonly<Array<SuccessWithKeyType>>>
                setGroupState: (id: ID, data: GroupBodyType) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                deleteGroup: (id: ID) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                getSchedules: () => Promise<Readonly<SchedulesType>>,
                createSchedule: (data: CreateOrSetScheduleBody) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                getSchedule: (id: ID) => Promise<Readonly<ScheduleType>>
                setSchedule: (id: ID, data: CreateOrSetScheduleBody) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                deleteSchedule: (id: ID) => Promise<Readonly<Array<SuccessType>>>,
                getScenes: () => Promise<Readonly<ScenesType>>,
                createScene: (data: CreateOrUpdateSceneBodyType) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                getScene: (id: ID) => Promise<Readonly<SceneType>>,
                setScene: (id: ID, data: CreateOrUpdateSceneBodyType) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                setSceneLightState: (sceneId: ID, lightId: ID, data: LightSceneBodyType) => Promise<Readonly<Array<SuccessWithKeyType>>>,
                deleteScene: (id: ID) => Promise<Promise<Array<SuccessWithKeyType>>>,

                getSensors: () => Promise<Promise<any>>,
                createSensor: () => Promise<Promise<any>>,
                searchForNewSensors: () => Promise<Promise<any>>,
                getNewSensors: () => Promise<Promise<any>>,
                getSensor: () => Promise<Promise<any>>,
                setSensor: () => Promise<Promise<any>>,
                setSensorConfig: () => Promise<Promise<any>>,
                setSensorState: () => Promise<Promise<any>>,
                deleteSensor:() => Promise<Promise<any>>,
                getRules: () => Promise<Promise<any>>,
                createRule: () => Promise<Promise<any>>,
                getRule: () => Promise<Promise<any>>,
                setRule: () => Promise<Promise<any>>,
                deleteRule: () => Promise<Promise<any>>,
                getResourceLinks: () => Promise<Promise<any>>,
                createResourceLink: () => Promise<Promise<any>>,
                getResourceLink: () => Promise<Promise<any>>,
                setResourceLink: () => Promise<Promise<any>>,
                deleteResourceLink: () => Promise<Promise<any>>,
            }
        }
    }

    const jsHue: () => IHue;
}
export default jsHue;
