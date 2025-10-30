package com.ti2cc.api.factory;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class ClassMapperFactory {
    public static Map<String, Object> toMap(Object object) {
        if (object == null) {
            return null;
        }

        Map<String, Object> map = new HashMap<>();

        Class<?> current = object.getClass();

        for (Field field : current.getDeclaredFields()) {
           field.setAccessible(true);
           try {
               Object value = field.get(object);

               if (value != null) {
                   map.put(field.getName(), value);
               }
           } catch (IllegalAccessException e) {
               throw  new RuntimeException("Failed to acess field" + field.getName());
           }
        }

        return map;
    }
}
