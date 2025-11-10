# 👨‍👩‍👧 Configuración de Familia Premium - Chau Pañal

## 🎯 Funcionalidad Premium: Compartir Registros con tu Pareja

Esta funcionalidad permite que usuarios Premium compartan los registros de su hijo/a con su pareja (mamá y papá).

## 📋 Configuración en Google Sheets

### 1. Crear Hoja "Familias"

En tu Google Sheet, crea una nueva hoja llamada **"Familias"** con los siguientes headers:

| FamilyID | UserEmail | BabyName | IsOwner |
|----------|-----------|----------|---------|
| family-123 | mamá@gmail.com | Juan | true |
| family-123 | papá@gmail.com | Juan | false |

**Columnas:**
- **A (FamilyID)**: ID único de la familia
- **B (UserEmail)**: Email del usuario
- **C (BabyName)**: Nombre del niño/a
- **D (IsOwner)**: `true` si es el dueño (quien creó la familia), `false` si es invitado

### 2. Estructura de Datos

- **FamilyID**: Identificador único que agrupa a los miembros de la familia
- **UserEmail**: Email del usuario (debe existir en la hoja "Usuarios")
- **BabyName**: Nombre del niño/a (se actualiza automáticamente en todos los miembros)
- **IsOwner**: Solo un usuario por familia debe ser `true` (el que creó la familia)

## 🚀 Cómo Funciona

### Para el Usuario Premium (Dueño):

1. **Agregar Nombre del Niño/a**:
   - Ve al Dashboard
   - En la sección "Gestión de Familia", haz clic en "Editar" junto al nombre
   - Ingresa el nombre del niño/a
   - Haz clic en "Guardar"

2. **Invitar a tu Pareja**:
   - En la sección "Gestión de Familia", ingresa el email de tu pareja
   - Haz clic en "Invitar"
   - Tu pareja debe estar registrada en Chau Pañal para poder ser invitada

### Para el Usuario Invitado:

1. **Aceptar Invitación**:
   - Una vez invitado, automáticamente verás los registros compartidos
   - El nombre del niño/a se actualiza automáticamente
   - Puedes crear registros que serán visibles para toda la familia

## 📊 Registros Compartidos

- **Todos los registros** creados por cualquier miembro de la familia son visibles para todos
- El **nombre del niño/a** se actualiza automáticamente en todos los registros
- Los registros muestran quién los creó (email del usuario)

## ⚠️ Notas Importantes

1. **Solo usuarios Premium** pueden usar esta funcionalidad
2. **El usuario invitado debe estar registrado** en Chau Pañal antes de ser invitado
3. **Solo el dueño** puede cambiar el nombre del niño/a
4. **Todos los miembros** pueden crear registros
5. **Los registros se comparten automáticamente** entre todos los miembros

## 🔧 Solución de Problemas

### Error: "El usuario no existe"
- El usuario invitado debe registrarse primero en Chau Pañal
- Verifica que el email sea correcto

### Error: "El usuario ya está en la familia"
- El usuario ya fue invitado anteriormente
- Verifica en la sección "Miembros de la Familia"

### Los registros no se comparten
- Verifica que ambos usuarios sean Premium
- Verifica que ambos estén en la misma familia (mismo FamilyID)
- Recarga la página

---

¿Necesitas ayuda? ¡Pregúntame! 🚀

