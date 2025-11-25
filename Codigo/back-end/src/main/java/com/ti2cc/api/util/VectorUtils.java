package com.ti2cc.api.util;

import org.postgresql.util.PGobject;

public final class VectorUtils {
    private VectorUtils() {
    }

    public static String toPgVectorLiteral(float[] vector) {
        if (vector == null || vector.length == 0) {
            return null;
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    public static float[] parsePgVector(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof float[]) {
            return (float[]) value;
        }

        if (value instanceof double[]) {
            double[] doubleArr = (double[]) value;
            float[] floatArr = new float[doubleArr.length];
            for (int i = 0; i < doubleArr.length; i++) {
                floatArr[i] = (float) doubleArr[i];
            }
            return floatArr;
        }

        String vectorString = null;
        if (value instanceof PGobject) {
            vectorString = ((PGobject) value).getValue();
        } else if (value instanceof String) {
            vectorString = (String) value;
        }

        if (vectorString == null) {
            return null;
        }

        vectorString = vectorString.trim();
        if (vectorString.startsWith("[")) {
            vectorString = vectorString.substring(1);
        }
        if (vectorString.endsWith("]")) {
            vectorString = vectorString.substring(0, vectorString.length() - 1);
        }

        if (vectorString.isEmpty()) {
            return new float[0];
        }

        String[] parts = vectorString.split(",");
        float[] vector = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            vector[i] = Float.parseFloat(parts[i].trim());
        }
        return vector;
    }
}
