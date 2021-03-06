/*
 * wijcollections - HashMap
 * https://github.com/webinfluenza/wijcollections
 *
 * Copyright (c) 2013 Benno Mielke
 * Licensed under the MIT license.
 */

define( ['private/AbstractCollection', 'private/ListObject'], function( AbstractCollection, ListObject ) {
    /**
     * HashMap constructor, inheriting from AbstractCollection Class.
     *
     * @constructor
     * @class HashMap
     * @extends {AbstractCollection}
     * @implements {ListObject}
     * @todo throw errors, implement entrySet()
     */
    function HashMap() {
        var that = this;

        /**
         * Array that'll store the original keys
         *
         * @private
         * @attribute keyList
         * @type {Array}
         */
        that.keyList = [];

        /**
         * Stores the mappings of the hash values for the keys to the values
         *
         * @private
         * @attribute keyHashToValueHash
         * @type {Object}
         */
        this.keyHashToValueHash = {};

        /**
         * Stores the value hash to the key hash strings. Using Object here,
         * because object lookups are faster than Array.indexOf() in general.
         *
         * @private
         * @attribute valueHashToKeyHash
         * @type {Object}
         */
        this.valueHashToKeyHash = {};

        /**
         * Maps the hash values of the keys to the original keys
         *
         * @private
         * @attribute keyHashToKey
         * @type {Object}
         */
        this.keyHashToKey = {}; // maps hash of keys to the orginal keys

        /**
         * Stores the values with the key in a ListObject. The key will be converted
         * in a hash string if needed.
         *
         * @private
         * @attribute valueList
         * @type {ListObject}
         */
        that.valueList = new ListObject();

        /**
         * Resetting the internal data objects and variables.
         *
         * @protected
         * @method resetHashMap
         */
        that.resetHashMap = function() {
            // reset all the things!
            that.keyList.length = 0;
            that.keyHashToValueHash = {};
            that.keyHashToKey = {};
            that.valueList.reset();

        };

        that.resetHashMap(); // fire it up here
    }

    HashMap.prototype = new AbstractCollection();
    HashMap.prototype.constructor = HashMap;

    /**
     * Removes all of the mappings from this map.
     *
     * @public
     * @method clear
     */
    HashMap.prototype.clear = function() {
        this.resetHashMap();
    };

    /**
     * Returns a copy of the <code>HashMap</code>.
     *
     * @public
     * @method clone
     * @return {HashMap} a copy of the actual <code>HashMap</code>
     */
    HashMap.prototype.clone = function() {
        // create an empty, new HashMap
        var copy = new HashMap();

        // copy all things ... in the new HashMap
        copy.putAll( this );

        // and return the new HashMap
        return copy;
    };

    /**
     * Returns <code>true</code> if this map contains a mapping for the specified <code>key</code>.
     *
     * @public
     * @method containsKey
     * @param  {Object} key the key to look for
     * @return {Boolean}    <code>true</code>, if the key exists, else <code>false</code>
     */
    HashMap.prototype.containsKey = function( key ) {
        // if the specified key isn't present, we can't return
        // anything
        if( key === undefined ) {
            return false;
        }

        // convert the key to a hash string if necessary
        key = this.hashObject( key );

        // check if the key is stored in the key list
        return this.keyHashToKey[key] !== undefined;
    };

    /**
     * Returns true if this map maps one or more keys to the specified value.
     *
     * @public
     * @method containsValue
     * @param  {Object} value the value to look for
     * @return {Boolean}      <code>true</code>, if the value exists, else <code>false</code>
     */
    HashMap.prototype.containsValue = function( value ) {
        if( value === undefined ) {
            return false;
        }

        var valueHash = this.hashObject( value );

        return this.valueHashToKeyHash[valueHash] !== undefined;
    };

    /**
     * Returns the value to which the specified key is mapped, or
     * <code>null</code> if this map contains no mapping for the key.
     *
     * @public
     * @method get
     * @param  {Object} key the key of the value that will be returned
     * @return {Object}     the mapped <code>value</code> to the key, or <code>null</code>
     *                          if the key isn't present
     */
    HashMap.prototype.get = function( key ) {
        if( this.containsKey( key ) === false ) {
            return null;
        }

        key = this.hashObject( key );

        // use the inherit get method from ListObject class to get the element
        return this.valueList.get( key ).ref;
    };

    /**
     * Checks, if there an existing key-value mapping.
     *
     * @public
     * @method isEmpty
     * @return {Boolean} <code>true</code>, if no key value mapping exists, else <code>false</code>
     */
    HashMap.prototype.isEmpty = function() {
        return this.keyList.length === 0;
    };

    /**
     * Returns an Array of the keys contained in this map.
     *
     * @public
     * @method keySet
     * @return {Array} Empty <code>Array</code>, if no key exists, else an <code>Array</code> with all keys
     */
    HashMap.prototype.keySet = function() {
        return this.keyList;
    };

    /**
     * Associate a specific value with a specific key.
     *
     * @public
     * @method put
     * @param  {Object} key   the key the value will be associated with
     * @param  {Object} value a value that will be associated with the key
     * @return {Object}       <code>null</code>, if the key isn't present yet, else the old stored
     *                        <code>value</code> of the key will be returned
     * @example
     *     var hm = new HashMap();
     *     hm.put( 'myKey', {'foo': new Date( 1984, 1, 15 )} ); // String as key with an Date object as value, returns null
     *     hm.put( {'bar': 1}, [1, 2, 3] ); // Object as key with Array as value, returns null
     *     hm.put( {'bar': 1}, 'Quux' ); // existing key with new value, the old value [1, 2, 3] will be returned
     */
    HashMap.prototype.put = function( key, value ) {
        // if anything is not defined, we need to return
        if( key === undefined || value === undefined || key === null ) {
            return null;
        }

        // pseudo-sort for keys that are objects actually
        if( key.constructor === Object ) {
            key = this.sortObjectByKeys( key );
        }

        // building the hash values (if needed) we need for the store process
        var keyHash = this.hashObject( key ),
            valueHash = this.hashObject( value );

        // the key is already present in our list
        if( this.keyHashToKey[keyHash] !== undefined ) {
            // get the old value (returning this later) and the hash value
            var oldValue = this.valueList.get( keyHash ).ref,
                oldValueHash = this.hashObject( oldValue );

            // replace the old value with the new one
            this.valueList.replace( keyHash, value, true );

            // update internal mappings
            this.keyHashToValueHash[keyHash] = valueHash;
            this.valueHashToKeyHash[valueHash] = keyHash;

            // remove the old value hash from the mapping
            delete this.valueHashToKeyHash[oldValueHash];

            // return the old value
            return oldValue;
        }

        // add the original key to the key array
        this.keyList.push( key );

        // add the original value to the interal ListObject instance
        this.valueList.add( value, keyHash );

        // map the keyHash to the valueHash
        this.keyHashToValueHash[keyHash] = valueHash;

        // store the value hash
        this.valueHashToKeyHash[valueHash] = keyHash;

        // map the hashKey to the original key
        this.keyHashToKey[keyHash] = key;

        // if the element wasn't present yet, return null
        return null;
    };

    /**
     * Copies all of the mappings from the specified <code>map</code> to this map.
     *
     * @public
     * @method putAll
     * @param  {HashMap} hashMapObject mappings to be stored in this map
     * @return {Object}                <code>null</code> if hashMapObject is either
     *                                 undefined or not a HashMap
     */
    HashMap.prototype.putAll = function( hashMapObject ) {
        if( hashMapObject === undefined || hashMapObject.constructor !== HashMap ) {
            return null;
        }

        var keySet = hashMapObject.keySet();

        for( var key in keySet ) {
            this.put( keySet[key], hashMapObject.get( keySet[key] ) );
        }
    };

    /**
     * Removes the mapping for a key from this map if it is present.
     *
     * @public
     * @method remove
     * @param  {Object} key key whose mapping is to be removed from the map
     * @return {Object}     previous <code>value</code> mapped the key, or <code>null</code> if
     *                      key was not found
     */
    HashMap.prototype.remove = function( key ) {
        if( key === undefined ) {
            return null;
        }

        key = this.hashObject( key );

        // if the key in the map?
        if( this.keyHashToKey[key] === undefined ) {
            return null;
        }

        // get the old value
        var oldValue = this.valueList.get( key ).ref,
            oldValueHash = this.hashObject( oldValue );

        // remove all the mappings
        delete this.keyHashToKey[key];
        delete this.keyHashToValueHash[key];
        delete this.valueHashToKeyHash[oldValueHash];
        this.valueList.delete( key );

        // iterate over the keyList Array
        for( var i = 0, iMax = this.keyList.length; i < iMax; i++ ) {
            // because the keyList Array stores the keys in their original
            // structure (not hashed), we have to comapre the hash values
            // for each entry to look for the key we want to delete
            var actualKey = this.hashObject( this.keyList[i] );

            if( key === actualKey ) {
                // remove the key from the list
                this.keyList.splice( i, 1 );

                // return the old value for that key
                return oldValue;
            }
        }

        // something went wrong here :-/
        return null;
    };

    /**
     * Returns the number of key-value mappings in this map
     *
     * @public
     * @method size
     * @return {Number} the number of key-value mappings in this map, <code>AbstractCollection.MAX_ARRAY_LENGTH</code>
     *                      if map contains more elements than <code>AbstractCollection.MAX_ARRAY_LENGTH</code>
     */
    HashMap.prototype.size = function() {
        if( this.keyList.length >= this.getMaxArrayLength() ) {
            return this.getMaxArrayLength();
        }

        return this.keyList.length;
    };

    /**
     * Returns an Array view of the values contained in this <code>HashMap</code>
     *
     * @public
     * @method values
     * @return {Array} empty <code>Array</code> if no value exists, else an <code>Array</code> with the values
     */
    HashMap.prototype.values = function() {
        var valueList = [];

        // iterate over the list object's keys
        for( var key in this.valueList.listObject ) {
            // store the value behind the key (if there's one)
            var value = this.valueList.get( key ).ref;

            if( value !== undefined ) {
                // if there's a valid value ...
                valueList.push( value );
            }
        }

        // return all values, or an empty Array
        return valueList;
    };

    return HashMap;
} );
