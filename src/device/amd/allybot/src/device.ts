import { Debuger } from "../../../device-base";
import { NDDevice } from "../../nd-device/device";
import { Main } from "./service/main";


export  class AllyBot extends NDDevice  {        

    init() {
        Debuger.Debuger.log("AllyBot init");
        Main.start();
    }
}