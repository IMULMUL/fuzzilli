// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
function Type() {}
Type.prototype.serialize = function() {
    var result = {}
    if(this.possibleType != null) result.possibleType = this.possibleType
    if(this.definiteType != null) result.definiteType = this.definiteType
    if(this.group != null) result.group = this.group
    if(this.properties != null) result.properties = this.properties.slice()
    if(this.methods != null) result.properties = this.methods.slice()
    if(this.signature != null) result.signature = this.signature.serialize()

    return result
}

function FunctionSignature() {}
FunctionSignature.prototype.serialize = function() {
    var result = {}
    if(this.inputTypes != null) {
        result.inputTypes = []
        for (const inputType in this.inputTypes) {
            result.inputTypes.append(inputType.serialize())
        }
    }
    if(this.outputType != null)  result.outputType = this.outputType.serialize()

    return result
}

// variableNumber: Type
var types = {}
// Must be kept in sync with TypeSystem.swift
baseTypes = {
    nothing: 0,
    undefined: 1 << 0,
    integer: 1 << 1,
    float: 1 << 2,
    string: 1 << 3,
    boolean: 1 << 4,
    object: 1 << 5,
    function: 1 << 6,
    constructor: 1 << 7,
    unknown: 1 << 8,
    bigint: 1 << 9,
    regexp: 1 << 10,
}
function updateType(number, value){
    function setType(rawValue) {
        types[number] = new Type()
        types[number].definiteType = rawValue
        types[number].possibleType = rawValue
    }
    try {
        // Fuzzilli handles both null/undefined as undefined
        if (value == null) {
            setType(baseTypes.undefined)
            return
        }
        if (Number.isInteger(value)) {
            setType(baseTypes.integer)
            return
        }
        if (typeof value === 'number') {
            setType(baseTypes.float)
            return
        }
        if (typeof value === 'string') {
            setType(baseTypes.string)
            return
        }
        if (typeof value === 'boolean') {
            setType(baseTypes.boolean)
            return
        }
        if (typeof value === 'bigint') {
            setType(baseTypes.bigint)
            return
        }
        try {
            if (value instanceof RegExp) {
                setType(baseTypes.regexp)
                return
            }
        } catch(err) {}

        // Set unknown if no type was matched
        setType(baseTypes.unknown)
    } catch(err) {}
}
