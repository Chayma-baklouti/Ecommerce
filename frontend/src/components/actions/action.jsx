import api from "../util/api"
import { getVariantKey } from "../util/cartUtils";

export const fetchProducts = (queryString) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/public/products?${queryString}`);
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch products",
         });
    }
};


export const fetchCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "CATEGORY_LOADER" });
        const { data } = await api.get(`/public/categories`);
        dispatch({
            type: "FETCH_CATEGORIES",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_ERROR" });
    } catch (error) {
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch categories",
         });
    }
};
// actions/action.js

// Ajouter au panier avec gestion de variante
export const addToCart = (product, quantity, toast) => (dispatch, getState) => {
  const variantKey = getVariantKey(product, product.selectedSize, product.selectedColor);
  const existingItem = getState().carts.cartItems.find(item => item.variantKey === variantKey);

  let newQuantity = quantity;
  if (existingItem) {
    newQuantity = existingItem.quantity + quantity;
    // Vérification du stock par variante (optionnel)
    const stockLimit = product.variantStock || product.stock || Infinity;
    if (newQuantity > stockLimit) {
      toast.error(`Stock insuffisant pour cette taille/couleur (max ${stockLimit})`);
      return;
    }
  }

  dispatch({
    type: 'ADD_TO_CART',
    payload: {
      ...product,
      variantKey,
      quantity: newQuantity,
    },
  });
  toast.success(`${product.productName || product.title} ajouté au panier`);
};

export const increaseCartQuantity = (item, toast, currentQuantity, onSuccess) => (dispatch) => {
  const stockLimit = item.variantStock || item.stock || Infinity;
  if (currentQuantity >= stockLimit) {
    toast.error(`Stock maximum atteint pour cette variante (${stockLimit})`);
    return;
  }
  dispatch({ type: 'INCREASE_CART_QUANTITY', payload: { variantKey: item.variantKey } });
  if (onSuccess) onSuccess();
};

export const decreaseCartQuantity = (item, newQuantity) => (dispatch) => {
  dispatch({ type: 'DECREASE_CART_QUANTITY', payload: { variantKey: item.variantKey } });
};

export const removeFromCart = (item, toast) => (dispatch) => {
  dispatch({ type: 'REMOVE_FROM_CART', payload: { variantKey: item.variantKey } });
  toast.success('Article retiré');
};




export const registerNewUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            const { data } = await api.post("/auth/signup", sendData);
            reset();
            toast.success(data?.message || "User Registered Successfully");
            navigate("/login");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || error?.response?.data?.password || "Internal Server Error");
        } finally {
            setLoader(false);
        }
};


export const logOutUser = (navigate) => (dispatch) => {
  // 1. Vider l'état Redux
  dispatch({ type: "LOG_OUT" });
  dispatch({ type: "CLEAR_CART" });          // vide le panier dans Redux
  dispatch({ type: "REMOVE_CHECKOUT_ADDRESS" }); // vide l'adresse

  // 2. Supprimer toutes les clés utilisateur dans localStorage
  localStorage.removeItem("auth");
  localStorage.removeItem("user");
  localStorage.removeItem("cartItems");
  localStorage.removeItem("CHECKOUT_ADDRESS");
  localStorage.removeItem("token");


  // 3. Rediriger vers login
  navigate("/login");
};


export const addUpdateUserAddress = (sendData, toast, addressId, setOpenAddressModal) => async (dispatch, getState) => {
    const { user } = getState().auth;
    if (!user || !user.jwtToken) {
        toast.error("Vous devez être connecté");
        return;
    }
    const config = { headers: { Authorization: `Bearer ${user.jwtToken}` } };
    
    dispatch({ type: "BUTTON_LOADER" });
    try {
        if (!addressId) {
            // Ajout d'une nouvelle adresse
            await api.post("/addresses", sendData, config);
            toast.success("Address added successfully");
        } else {
            // Modification d'une adresse existante
            await api.put(`/addresses/${addressId}`, sendData, config);
            toast.success("Address updated successfully");
        }
        // Recharger la liste des adresses
        await dispatch(getUserAddresses());
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        const msg = error?.response?.data?.message || "Failed to save address";
        toast.error(msg);
        dispatch({ type: "IS_ERROR", payload: msg });
    } finally {
        setOpenAddressModal(false);
        dispatch({ type: "BUTTON_LOADER_OFF" }); // à ajouter dans votre reducer
    }
};

export const deleteUserAddress = 
    (toast, addressId, setOpenDeleteModal) => async (dispatch, getState) => {
    try {
        dispatch({ type: "BUTTON_LOADER" });
        await api.delete(`/addresses/${addressId}`);
        dispatch({ type: "IS_SUCCESS" });
        dispatch(getUserAddresses());
        dispatch(clearCheckoutAddress());
        toast.success("Address deleted successfully");
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Some Error Occured",
         });
    } finally {
        setOpenDeleteModal(false);
    }
};

export const clearCheckoutAddress = () => {
    return {
        type: "REMOVE_CHECKOUT_ADDRESS",
    }
};
export const getUserAddresses = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { user } = getState().auth;
        const config = { headers: { Authorization: `Bearer ${user.jwtToken}` } };
        const { data } = await api.get(`/users/addresses`, config);
        dispatch({ type: "USER_ADDRESS", payload: data });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch user addresses",
        });
    }
};



export const selectUserCheckoutAddress = (address) => {
    localStorage.setItem("CHECKOUT_ADDRESS", JSON.stringify(address));
    
    return {
        type: "SELECT_CHECKOUT_ADDRESS",
        payload: address,
    }
};


export const addPaymentMethod = (method) => {
    return {
        type: "ADD_PAYMENT_METHOD",
        payload: method,
    }
};
export const createUserCart = (sendCartItems) => async (dispatch, getState) => {
    console.log("🔵 [createUserCart] Début avec sendCartItems:", sendCartItems);
    try {
        dispatch({ type: "IS_FETCHING" });
        console.log("🟡 [createUserCart] IS_FETCHING dispatché");

        console.log("📦 [createUserCart] Récupération de l'état auth...");
        const { user } = getState().auth;
        console.log("👤 [createUserCart] user depuis auth:", user);

        if (!user) {
            console.error("❌ [createUserCart] Aucun utilisateur trouvé dans auth");
            throw new Error("Utilisateur non connecté");
        }
        if (!user.jwtToken) {
            console.error("❌ [createUserCart] jwtToken manquant pour l'utilisateur:", user);
            throw new Error("Token manquant");
        }

        const tokenPreview = user.jwtToken.substring(0, 30) + "...";
        console.log("🔑 [createUserCart] Token utilisé (début):", tokenPreview);
        const config = { headers: { Authorization: `Bearer ${user.jwtToken}` } };
        console.log("📡 [createUserCart] Configuration headers:", config);

        if (!sendCartItems) {
            console.error("❌ [createUserCart] sendCartItems est null ou undefined");
            throw new Error("Aucun article à ajouter");
        }

        if (Array.isArray(sendCartItems)) {
            console.log(`📦 [createUserCart] Tableau de ${sendCartItems.length} article(s) détecté`);
            for (let i = 0; i < sendCartItems.length; i++) {
                const item = sendCartItems[i];
                const { productId, quantity } = item;
                console.log(`🔄 [createUserCart] Traitement article ${i+1}: productId=${productId}, quantity=${quantity}`);
                const url = `/carts/products/${productId}/quantity/${quantity}`;
                console.log(`📡 [createUserCart] Appel POST ${url} avec config`, config);
                try {
                    const response = await api.post(url, null, config);
                    console.log(`✅ [createUserCart] Réponse pour productId ${productId}: status ${response.status}`, response.data);
                } catch (innerErr) {
                    console.error(`❌ [createUserCart] Erreur lors de l'appel pour productId ${productId}:`, innerErr);
                    throw innerErr;
                }
            }
        } else if (sendCartItems && typeof sendCartItems === 'object' && sendCartItems.productId) {
            console.log(`📦 [createUserCart] Objet unique détecté:`, sendCartItems);
            const { productId, quantity } = sendCartItems;
            const url = `/carts/products/${productId}/quantity/${quantity}`;
            console.log(`📡 [createUserCart] Appel POST ${url} avec config`, config);
            const response = await api.post(url, null, config);
            console.log(`✅ [createUserCart] Réponse: status ${response.status}`, response.data);
        } else {
            console.error("❌ [createUserCart] Format de sendCartItems non reconnu:", sendCartItems);
            throw new Error("Format invalide");
        }

        console.log("🔄 [createUserCart] Appel de getUserCart pour rafraîchir");
        await dispatch(getUserCart());
        console.log("✅ [createUserCart] Succès, dispatch IS_SUCCESS");
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.error("🔴 [createUserCart] ERREUR CATCH:", error);
        if (error.response) {
            console.error("📄 [createUserCart] Détails réponse serveur:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            console.error("📡 [createUserCart] Pas de réponse reçue:", error.request);
        } else {
            console.error("💥 [createUserCart] Erreur config:", error.message);
        }
        dispatch({ type: "IS_ERROR", payload: error?.response?.data?.message || error.message || "Failed to create cart items" });
    }
};

export const getUserCart = () => async (dispatch, getState) => {
    console.log("🔵 [getUserCart] Début");
    try {
        dispatch({ type: "IS_FETCHING" });
        console.log("🟡 [getUserCart] IS_FETCHING dispatché");

        const { user } = getState().auth;
        console.log("👤 [getUserCart] Utilisateur depuis auth:", user);

        if (!user) {
            console.error("❌ [getUserCart] Aucun utilisateur");
            throw new Error("Non authentifié");
        }
        if (!user.jwtToken) {
            console.error("❌ [getUserCart] jwtToken manquant");
            throw new Error("Token manquant");
        }

        const tokenPreview = user.jwtToken.substring(0, 30) + "...";
        console.log("🔑 [getUserCart] Token utilisé:", tokenPreview);
        const config = { headers: { Authorization: `Bearer ${user.jwtToken}` } };
        console.log("📡 [getUserCart] Config:", config);

        const url = '/carts/users/cart';
        console.log(`🌐 [getUserCart] Appel GET ${url} avec config`);
        const { data } = await api.get(url, config);
        console.log("✅ [getUserCart] Réponse reçue:", data);
        console.log(`📦 [getUserCart] Nombre de produits: ${data.products?.length || 0}`);

        dispatch({
            type: "GET_USER_CART_PRODUCTS",
            payload: data.products,
            totalPrice: data.totalPrice,
            cartId: data.cartId
        });
        console.log("💾 [getUserCart] Sauvegarde dans localStorage cartItems");
        localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
        dispatch({ type: "IS_SUCCESS" });
        console.log("✅ [getUserCart] Terminé avec succès");
    } catch (error) {
        console.error("🔴 [getUserCart] ERREUR:", error);
        if (error.response) {
            console.error("📄 [getUserCart] Statut:", error.response.status, "Données:", error.response.data);
        } else if (error.request) {
            console.error("📡 [getUserCart] Pas de réponse");
        } else {
            console.error("💥 [getUserCart] Erreur config:", error.message);
        }
        dispatch({ type: "IS_ERROR", payload: error?.response?.data?.message || "Failed to fetch cart items" });
    }
};
export const createStripePaymentSecret 
    = (sendData) => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING" });
            const { data } = await api.post("/order/stripe-client-secret", sendData);
            dispatch({ type: "CLIENT_SECRET", payload: data });
              localStorage.setItem("client-secret", JSON.stringify(data));
              dispatch({ type: "IS_SUCCESS" });
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to create client secret");
        }
};


export const stripePaymentConfirmation 
    = (sendData, setErrorMesssage, setLoadng, toast) => async (dispatch, getState) => {
        try {
            const response  = await api.post("/order/users/payments/online", sendData);
            if (response.data) {
                localStorage.removeItem("CHECKOUT_ADDRESS");
                localStorage.removeItem("cartItems");
                localStorage.removeItem("client-secret");
                dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS"});
                dispatch({ type: "CLEAR_CART"});
                toast.success("Order Accepted");
              } else {
                setErrorMesssage("Payment Failed. Please try again.");
              }
        } catch (error) {
            setErrorMesssage("Payment Failed. Please try again.");
        }
};

export const analyticsAction = () => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING"});
            const { data } = await api.get('/admin/app/analytics');
            dispatch({
                type: "FETCH_ANALYTICS",
                payload: data,
            })
            dispatch({ type: "IS_SUCCESS"});
        } catch (error) {
            dispatch({ 
                type: "IS_ERROR",
                payload: error?.response?.data?.message || "Failed to fetch analytics data",
            });
        }
};

export const getOrdersForDashboard = (queryString, isAdmin) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/orders" : "/seller/orders";
        const { data } = await api.get(`${endpoint}?${queryString}`);
        dispatch({
            type: "GET_ADMIN_ORDERS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch orders data",
         });
    }
};



export const updateOrderStatusFromDashboard =
     (orderId, orderStatus, toast, setLoader, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/orders/" : "/seller/orders/";
        const { data } = await api.put(`${endpoint}${orderId}/status`, { status: orderStatus});
        toast.success(data.message || "Order updated successfully");
        await dispatch(getOrdersForDashboard());
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
        setLoader(false)
    }
};


export const dashboardProductsAction = (queryString, isAdmin) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/products" : "/seller/products";
        const { data } = await api.get(`${endpoint}?${queryString}`);
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch dashboard products",
         });
    }
};


export const updateProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.put(`${endpoint}${sendData.id}`, sendData);
        toast.success("Product update successful");
        reset();
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        toast.error(error?.response?.data?.description || "Product update failed");
     
    }
};



export const addNewProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async(dispatch, getState) => {
        try {
            setLoader(true);
            const endpoint = isAdmin ? "/admin/categories/" : "/seller/categories/";
            await api.post(`${endpoint}${sendData.categoryId}/product`,
                sendData
            );
            toast.success("Product created successfully");
            reset();
            setOpen(false);
            await dispatch(dashboardProductsAction());
        } catch (error) {
            console.error(err);
            toast.error(err?.response?.data?.description || "Product creation failed");
        } finally {
            setLoader(false);
        }
    }

export const deleteProduct = 
    (setLoader, productId, toast, setOpenDeleteModal, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true)
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.delete(`${endpoint}${productId}`);
        toast.success("Product deleted successfully");
        setLoader(false);
        setOpenDeleteModal(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        console.log(error);
        toast.error(
            error?.response?.data?.message || "Some Error Occured"
        )
    }
};


export const updateProductImageFromDashboard = 
    (formData, productId, toast, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.put(`${endpoint}${productId}/image`, formData);
        toast.success("Image upload successful");
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        toast.error(error?.response?.data?.description || "Product Image upload failed");
     
    }
};

export const getAllCategoriesDashboard = (queryString) => async (dispatch) => {
  dispatch({ type: "CATEGORY_LOADER" });
  try {
    const { data } = await api.get(`/public/categories?${queryString}`);
    dispatch({
      type: "FETCH_CATEGORIES",
      payload: data["content"],
      pageNumber: data["pageNumber"],
      pageSize: data["pageSize"],
      totalElements: data["totalElements"],
      totalPages: data["totalPages"],
      lastPage: data["lastPage"],
    });

    dispatch({ type: "CATEGORY_SUCCESS" });
  } catch (err) {
    console.log(err);

    dispatch({
      type: "IS_ERROR",
      payload: err?.response?.data?.message || "Failed to fetch categories",
    });
  }
};

export const createCategoryDashboardAction =
  (sendData, setOpen, reset, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      await api.post("/admin/categories", sendData);
      dispatch({ type: "CATEGORY_SUCCESS" });
      reset();
      toast.success("Category Created Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to create new category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const updateCategoryDashboardAction =
  (sendData, setOpen, categoryID, reset, toast) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.put(`/admin/categories/${categoryID}`, sendData);

      dispatch({ type: "CATEGORY_SUCCESS" });

      reset();
      toast.success("Category Update Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to update category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const deleteCategoryDashboardAction =
  (setOpen, categoryID, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.delete(`/admin/categories/${categoryID}`);

      dispatch({ type: "CATEGORY_SUCCESS" });

      toast.success("Category Delete Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const authenticateSignInUser = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
    try {
        setLoader(true);
        const { data } = await api.post("/auth/signin", sendData);
        
        // data.jwtToken contient peut-être "ecom-jwt=eyJhbGciOiJIUzI1NiJ9..."
        let rawToken = data.jwtToken;
        let cleanToken = rawToken;
        if (rawToken && rawToken.startsWith('ecom-jwt=')) {
            // Extraire la partie après "ecom-jwt="
            cleanToken = rawToken.substring('ecom-jwt='.length);
            // Supprimer les éventuels paramètres après ';'
            const semicolonIndex = cleanToken.indexOf(';');
            if (semicolonIndex !== -1) {
                cleanToken = cleanToken.substring(0, semicolonIndex);
            }
        }
        
        // Stocker le token nettoyé
        localStorage.setItem("token", cleanToken);
        
        // Mettre à jour l'objet user avec le token propre
        const userData = { ...data, jwtToken: cleanToken };
        localStorage.setItem("auth", JSON.stringify(userData));
        
        dispatch({ type: "LOGIN_USER", payload: userData });
        reset();
        toast.success("Login Success");
        navigate("/");
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
        setLoader(false);
    }
};
  export const getAllSellersDashboard =
  (queryString) => async (dispatch, getState) => {
    const { user } = getState().auth;
    try {
      dispatch({ type: "IS_FETCHING" });
      const { data } = await api.get(`/auth/sellers?${queryString}`);
      dispatch({
        type: "GET_SELLERS",
        payload: data["content"],
        pageNumber: data["pageNumber"],
        pageSize: data["pageSize"],
        totalElements: data["totalElements"],
        totalPages: data["totalPages"],
        lastPage: data["lastPage"],
      });

      dispatch({ type: "IS_SUCCESS" });
    } catch (err) {
      console.log(err);
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Failed to fetch sellers data",
      });
    }
  };

export const addNewDashboardSeller =
  (sendData, toast, reset, setOpen, setLoader) => async (dispatch) => {
    try {
      setLoader(true);
      await api.post("/auth/signup", sendData);
      reset();
      toast.success("Seller registered successfully!");

      await dispatch(getAllSellersDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.password ||
          "Internal Server Error"
      );
    } finally {
      setLoader(false);
      setOpen(false);
    }
  };
  export const authenticateGoogleUser = (credentialResponse, toast, navigate) => async (dispatch) => {
    try {
        const response = await axios.post("/api/auth/google", {
            token: credentialResponse.credential  // JWT token from Google
        });

        const { jwtToken, username, roles } = response.data;

        // Save to localStorage
        localStorage.setItem("auth", JSON.stringify({ jwtToken, username, roles }));

        // Dispatch to Redux
        dispatch({
            type: "SET_USER",
            payload: { jwtToken, username, roles }
        });

        toast.success(`Welcome ${username}!`);
        navigate("/");

    } catch (error) {
        toast.error(error.response?.data?.message || "Google login failed");
    }
};