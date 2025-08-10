import { GameMode, GeneratorOption, GeneratorOptions } from "../model";
import { RouletteGameModeDetails, RouletteSpinGameMode, Spin } from "./rouletteSpin";

export interface WackyExtensionsGameModeDetails extends RouletteGameModeDetails {
    loudOnly: boolean;
}

interface AdminEventPayload {
    playerIndex: number;
    spin: Spin;
}

export class WackyExtensionsGameMode extends RouletteSpinGameMode implements GameMode {
    getGeneratorOptions(): GeneratorOption[] {
        return [
            ...super.getGeneratorOptions(),
            {
                id: 'loudOnly',
                caption: "Only loud firearm/explosive kills",
                type: "boolean"
            }
        ];
    }

    async generate(options: GeneratorOptions, players: string[]): Promise<WackyExtensionsGameModeDetails> {
        const originalState = await super.generate(options, players);

        if (options['loudOnly']) {
            originalState.currentSpin = WackyExtensionsGameMode.makeSpinLoudOnly(originalState.currentSpin);
        }

        return {
            ...originalState,
            loudOnly: options['loudOnly'] as boolean
        }
            
    }

    async handleAdminEvent(event: string, payload: AdminEventPayload, currentState: WackyExtensionsGameModeDetails): Promise<WackyExtensionsGameModeDetails> {
        const newState = await super.handleAdminEvent(event, payload, currentState);

        if (event === "respin" && currentState.loudOnly) {
            newState.currentSpin = WackyExtensionsGameMode.makeSpinLoudOnly(newState.currentSpin);
        }

        return {
            ...newState,
            loudOnly: currentState.loudOnly
        };
    }

    private static makeSpinLoudOnly(spin: Spin): Spin {
        let methodOptions = [
            {
		        "name": "Pistol",
		        "largeWeapon": false,
		        "tileUrl": "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_pistol.jpg",
                "selectedVariant": "Loud"
            }, {
                "name": "Sniper Rifle",
		        "largeWeapon": true,
		        "tileUrl": "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_sniperrifle.jpg",
                "selectedVariant": "Loud"
            }, {
                "name": "Assault Rifle",
		        "largeWeapon": true,
		        "tileUrl": "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_assaultrifle.jpg",
                "selectedVariant": "Loud"
            }, {
                "name": "SMG",
		        "largeWeapon": false,
		        "tileUrl": "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_smg.jpg",
                "selectedVariant": "Loud"
            }, {
                "name": "Shotgun",
		        "largeWeapon": true,
		        "tileUrl": "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_shotgun.jpg",
                "selectedVariant": "Loud"
            }, {
                "name": "Explosive (Weapon)",
                "largeWeapon": false,
                "tileUrl": "https://media.hitmaps.com/img/hitman3/contractconditions/condition_killmethod_explosive.jpg",
                "selectedVariant": "Loud"
            }, {
                "name": "Explosive (Weapon)",
                "largeWeapon": false,
                "tileUrl": "https://media.hitmaps.com/img/hitmaps-roulette/impact-explosive.png",
                "selectedVariant": "Impact"
            }
        ];

        for (const target of spin.targetConditions) {
            methodOptions.sort(() => Math.random() - 0.5);
            const condition = methodOptions.pop()!;
            if (condition.largeWeapon) {
                methodOptions = methodOptions.filter((o) => !o.largeWeapon);
            }
            target.killMethod = condition;
        }

        return spin;
    }
}